import Web3 from 'web3';
import config from '@config/index';
import { abi } from '@abi/WebaverseERC721.json';
import axios, { AxiosResponse } from 'axios';
import NFTMetadataModel from '@models/nft-metadata.model';
import { INFTMetaData, INFTMetaDataRequest } from '@/interfaces/nft.interface';
import SyncConfigModel from '@/models/sync-config.model';
import TokenOwnerModel from '@/models/webaverse-token-owner.model';
import isIPFS from 'is-ipfs';
import { logger } from '@/utils/logger';
import { EventData } from 'web3-eth-contract';

class WebaverseERC721Service {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  async syncData() {
    const web3 = new Web3(config.blockchain.sidechain.url);
    const WebaverseERC721Contract = new web3.eth.Contract(abi as any, config.blockchain.sidechain.ERC721Contract.address);

    let lastSyncedBlock = config.blockchain.sidechain.ERC721Contract.startingBlock;
    const syncConfig = await SyncConfigModel.findOne({ network: 'sidechain', task: 'syncWebaverseERC721' });
    if (syncConfig && syncConfig.lastSyncedBlock && syncConfig.lastSyncedBlock > lastSyncedBlock) {
      lastSyncedBlock = syncConfig.lastSyncedBlock;
    }

    const latestBlock = await web3.eth.getBlockNumber();
    if (lastSyncedBlock === latestBlock) {
      return;
    }

    let transferEvents: EventData[] = [];
    let uriEvents: EventData[] = [];

    try {
      transferEvents = await WebaverseERC721Contract.getPastEvents('Transfer', {
        fromBlock: lastSyncedBlock + 1,
        toBlock: latestBlock,
      });

      uriEvents = await WebaverseERC721Contract.getPastEvents('URI', {
        fromBlock: lastSyncedBlock + 1,
        toBlock: latestBlock,
      });
    } catch (error) {
      logger.error(error);
      return;
    }

    try {
      await this.syncTokenIDOwners(transferEvents);
      await this.storeMetadata(uriEvents);
    } catch (error) {
      logger.error(error);
      return;
    }
    await SyncConfigModel.findOneAndUpdate({ network: 'sidechain', task: 'syncWebaverseERC721' }, { lastSyncedBlock: latestBlock }, { upsert: true });
  }

  async getTokenIDsByOwner(owner: string): Promise<String[]> {
    return (await TokenOwnerModel.find({ owner, network: 'sidechain' })).map(tokenOwner => tokenOwner.tokenID);
  }

  async getTokenIDsByMinter(minter: string): Promise<String[]> {
    return (await TokenOwnerModel.find({ minter, network: 'sidechain' })).map(tokenOwner => tokenOwner.tokenID);
  }

  async getTokenMetadata(tokenID: string): Promise<INFTMetaData> {
    return await NFTMetadataModel.findOne({ tokenID, network: 'sidechain', contractAddress: config.blockchain.sidechain.ERC721Contract.address })
      .lean()
      .exec();
  }

  async getAllTokenMetadata() {
    return await NFTMetadataModel.find({ network: 'sidechain', contractAddress: config.blockchain.sidechain.ERC721Contract.address }).lean().exec();
  }

  public getTokensInIdRange = async (startRange: Number, endRange: Number) => {
    const ids = [];
    for (let i: any = startRange; i <= endRange; i++) {
      ids.push(`${i}`);
    }
    const tokens = await NFTMetadataModel.find({
      tokenID: { $in: ids },
      network: 'sidechain',
      contractAddress: config.blockchain.sidechain.ERC721Contract.address,
    })
      .lean()
      .exec();
    return tokens;
  };

  async getTokenOwner(tokenID: string): Promise<string> {
    const tokenOwner = await TokenOwnerModel.findOne({ tokenID, network: 'sidechain' }).lean().exec();
    return tokenOwner.owner;
  }

  async getTokenMinter(tokenID: string): Promise<string> {
    const tokenOwner = await TokenOwnerModel.findOne({ tokenID, network: 'sidechain' }).lean().exec();
    return tokenOwner.minter;
  }

  private async syncTokenIDOwners(events): Promise<void> {
    for (const event of events) {
      const tokenID = event.returnValues.tokenId;
      const from = event.returnValues.from.trim().toLowerCase();
      const to = event.returnValues.to.trim().toLowerCase();
      if (from === '0x0000000000000000000000000000000000000000') {
        await TokenOwnerModel.findOneAndReplace({ tokenID }, { owner: to, network: 'sidechain', minter: to, tokenID }, { upsert: true });
      } else {
        await TokenOwnerModel.findOneAndUpdate({ tokenID }, { owner: to }, { upsert: true });
      }
    }
  }

  private async storeMetadata(events): Promise<any> {
    for (const event of events) {
      const tokenID = event.returnValues.id;
      const metadata = await this.fetchMetadata(event.returnValues.uri);
      await NFTMetadataModel.findOneAndReplace(
        { network: 'sidechain', contractAddress: config.blockchain.sidechain.ERC721Contract.address, tokenID },
        {
          network: 'sidechain',
          contractAddress: config.blockchain.sidechain.ERC721Contract.address,
          tokenID,
          image: metadata.metadata.image,
          image_data: metadata.metadata.image_data,
          external_url: metadata.metadata.external_url,
          description: metadata.metadata.description,
          name: metadata.metadata.name,
          attributes: metadata.metadata.attributes,
          background_color: metadata.metadata.background_color,
          animation_url: metadata.metadata.animation_url,
          youtube_url: metadata.metadata.youtube_url,
          hash: metadata.metadata.hash,
          ext: metadata.metadata.ext,
        },
        {
          upsert: true,
        },
      );
    }
  }

  private async fetchMetadata(uri): Promise<{
    metadata: INFTMetaDataRequest;
    uri: string;
  }> {
    console.log('fetchMetadata', uri);
    if (uri.startsWith('ipfs://')) {
      uri = uri.replace('ipfs://', 'https://ipfs.webaverse.com/ipfs/');
    } else if (isIPFS.cidPath(uri) || isIPFS.cid(uri)) {
      uri = 'https://ipfs.webaverse.com/ipfs/' + uri;
    } else if (isIPFS.path(uri)) {
      uri = 'https://ipfs.webaverse.com' + uri;
    }

    let res: AxiosResponse<INFTMetaDataRequest>;
    try {
      res = await axios.get<INFTMetaDataRequest>(uri);
    } catch (error) {
      if (error.response && (`${error.response.code}` === '429' || `${error.response.code}` === '408')) {
        console.log('Too many requests or timeout error, sleeping for 5 seconds');
        await new Promise(resolve => setTimeout(resolve, 5000));
        res = await axios.get<INFTMetaDataRequest>(uri);
      } else {
        if (`${error.response.status}` === '429' || `${error.response.code}` === '408') {
          console.log('Too many requests or timeout error, sleeping for 5 seconds');
          await new Promise(resolve => setTimeout(resolve, 5000));
          res = await axios.get<INFTMetaDataRequest>(uri);
        }
      }
    }
    try {
      const contentType = res.headers['content-type'];
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid content type');
      }

      const { image, image_data, external_url, description, name, attributes, background_color, animation_url, youtube_url, hash, ext } = res.data;
      const returnData = {
        metadata: {
          image: image || '',
          image_data: image_data || '',
          external_url: external_url || '',
          description: description || '',
          name: name || '',
          attributes: attributes || [],
          background_color: background_color || '',
          animation_url: animation_url || '',
          youtube_url: youtube_url || '',
          hash: hash || '',
          ext: ext || '',
        },
        uri,
      };
      return returnData;
    } catch (error) {
      return {
        metadata: {
          image: '',
          image_data: '',
          external_url: '',
          description: '',
          name: '',
          attributes: [],
          background_color: '',
          animation_url: '',
          youtube_url: '',
          hash: '',
          ext: '',
        },
        uri,
      };
    }
  }
}

export default WebaverseERC721Service;

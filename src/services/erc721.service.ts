import Web3 from 'web3';
import config from 'config';
import { abi } from '@abi/WebaverseERC721.json';
import axios, { AxiosResponse } from 'axios';
import MetadataModel from '@models/metadata.model';
import { IMetaData, IMetaDataRequest } from '@interfaces/metadata.interface';
import { FetchMetaDataDto } from '@/dtos/metadata.dto';
import { validateOrReject } from 'class-validator';
import SyncConfigModel from '@/models/sync-config.model';
import TokenOwnerModel from '@/models/token-owner.model';
import isIPFS from 'is-ipfs';

class ERC721Service {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}
  async syncTokenIDOwners(): Promise<void> {
    const networks = config.get('blockchains') as any[];
    for (let i = 0; i < networks.length; i++) {
      const { name, url, ERC721ContractAddress } = networks[i];
      const web3 = new Web3(url);
      const contract = new web3.eth.Contract(abi as any, ERC721ContractAddress);
      const syncConfig = await SyncConfigModel.findOne({ network: name, task: 'syncTokenIDOwners' });

      let lastSyncedBlock = networks[i].startingBlock;
      if (syncConfig && syncConfig.lastSyncedBlock && syncConfig.lastSyncedBlock > networks[i].startingBlock) {
        lastSyncedBlock = syncConfig.lastSyncedBlock;
      }

      const latestBlock = await web3.eth.getBlockNumber();
      if (lastSyncedBlock === latestBlock) {
        continue;
      }

      let events = [];
      try {
        events = await contract.getPastEvents('Transfer', {
          fromBlock: lastSyncedBlock + 1,
          toBlock: latestBlock,
        });
      } catch (error) {
        console.log(error.message);
        continue;
      }
      for (const event of events) {
        const tokenID = event.returnValues.tokenId;
        const to = event.returnValues.to.trim().toLowerCase();
        await TokenOwnerModel.findOneAndUpdate({ tokenID }, { owner: to, network: name }, { upsert: true });
      }
      await SyncConfigModel.findOneAndUpdate({ network: name, task: 'syncTokenIDOwners' }, { lastSyncedBlock: latestBlock }, { upsert: true });
    }
  }

  async storeMetadata(): Promise<any> {
    const networks = config.get('blockchains') as any[];
    for (let i = 0; i < networks.length; i++) {
      console.log(networks[i].name);
      const { name, url, ERC721ContractAddress } = networks[i];
      const web3 = new Web3(url);
      const contract = new web3.eth.Contract(abi as any, ERC721ContractAddress);
      const syncConfig = await SyncConfigModel.findOne({ network: name, task: 'storeMetadata' });

      let lastSyncedBlock = networks[i].startingBlock;
      if (syncConfig && syncConfig.lastSyncedBlock && syncConfig.lastSyncedBlock > networks[i].startingBlock) {
        lastSyncedBlock = syncConfig.lastSyncedBlock;
      }

      const latestBlock = await web3.eth.getBlockNumber();
      if (lastSyncedBlock === latestBlock) {
        continue;
      }

      let events = [];
      try {
        events = await contract.getPastEvents('URI', {
          fromBlock: lastSyncedBlock + 1,
          toBlock: latestBlock,
        });
      } catch (error) {
        console.log(error.message);
        continue;
      }

      for (const event of events) {
        const metadata = await this.fetchMetadata(event, name);
        await MetadataModel.findOneAndReplace({ tokenID: metadata.tokenID }, metadata, {
          upsert: true,
        });
      }
      await SyncConfigModel.findOneAndUpdate({ network: name, task: 'storeMetadata' }, { lastSyncedBlock: latestBlock }, { upsert: true });
    }
  }

  async getTokenIDsByOwner(owner: string, network: string): Promise<String[]> {
    return (await TokenOwnerModel.find({ owner, network })).map(tokenOwner => tokenOwner.tokenID);
  }

  async getTokenMetadata(tokenID: string, network: string): Promise<IMetaData> {
    return await MetadataModel.findOne({ tokenID, network }).lean().exec();
  }

  async getAllTokenMetadata(network: string) {
    return await MetadataModel.find({ network });
  }

  private async fetchMetadata(event, network): Promise<IMetaData> {
    const tokenID = event.returnValues.id;

    let uri = event.returnValues.uri;
    if (isIPFS.cidPath(uri) || isIPFS.path(uri) || isIPFS.cid(uri)) {
      uri = 'https://gateway.pinata.cloud/ipfs/' + uri;
    }
    let res: AxiosResponse<IMetaDataRequest>;
    try {
      res = await axios.get<IMetaDataRequest>(uri);
    } catch (error) {
      if (error.response && (`${error.response.code}` === '429' || `${error.response.code}` === '408')) {
        console.log('Too many requests or timeout error, sleeping for 5 seconds');
        await new Promise(resolve => setTimeout(resolve, 5000));
        res = await axios.get<IMetaDataRequest>(uri);
      } else {
        if (`${error.response.status}` === '429' || `${error.response.code}` === '408') {
          console.log('Too many requests or timeout error, sleeping for 5 seconds');
          await new Promise(resolve => setTimeout(resolve, 5000));
          res = await axios.get<IMetaDataRequest>(uri);
        }
      }
    }
    try {
      const contentType = res.headers['content-type'];
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid content type');
      }
      const metadata = res.data;

      console.log(metadata);

      const dto = new FetchMetaDataDto();
      dto.name = metadata.name;
      dto.image = metadata.image;
      dto.image_data = metadata.image_data;
      dto.description = metadata.description;
      dto.attributes = metadata.attributes;
      dto.external_url = metadata.external_url;
      dto.background_color = metadata.background_color;
      dto.animation_url = metadata.animation_url;
      dto.youtube_url = metadata.youtube_url;
      dto.hash = metadata.hash;
      dto.ext = metadata.ext;

      await validateOrReject(dto);
      return {
        tokenID,
        uri,
        network,
        ...dto,
      };
    } catch (error) {
      console.log(error.message);
      return {
        tokenID,
        uri,
        network,
      };
    }
  }

  public getTokensInIdRange = async (startRange: Number, endRange: Number, network: string) => {
    const ids = [];
    for (let i: any = startRange; i <= endRange; i++) {
      ids.push(`${i}`);
    }
    const tokens = await MetadataModel.find({ tokenID: { $in: ids }, network })
      .lean()
      .exec();
    return tokens;
  };

  async getTokenOwner(tokenID: string, network: string): Promise<string> {
    const tokenOwner = await TokenOwnerModel.findOne({ tokenID, network }).lean().exec();
    return tokenOwner.owner;
  }
}

export default ERC721Service;

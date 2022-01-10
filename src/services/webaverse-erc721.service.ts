import Web3 from 'web3';
import config from '@config/index';
import { abi } from '@abi/WebaverseERC721.json';
import NFTMetadataModel from '@models/nft-metadata.model';
import { INFTMetaData, INFTMetaDataRequest } from '@/interfaces/nft.interface';
import SyncConfigModel from '@/models/sync-config.model';
import { logger } from '@/utils/logger';
import { EventData, Contract } from 'web3-eth-contract';

class WebaverseERC721Service {
  web3 = new Web3(config.blockchain.sidechain.url);
  WebaverseERC721Contract: Contract;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {
    this.WebaverseERC721Contract = new this.web3.eth.Contract(abi as any, config.blockchain.sidechain.ERC721Contract.address);
  }

  public syncData = async () => {
    let lastSyncedBlock = 0;
    const syncConfig = await SyncConfigModel.findOne({ network: 'sidechain', task: 'syncWebaverseERC721' });
    if (syncConfig && syncConfig.lastSyncedBlock && syncConfig.lastSyncedBlock > lastSyncedBlock) {
      lastSyncedBlock = syncConfig.lastSyncedBlock;
    }

    const latestBlock = await this.web3.eth.getBlockNumber();

    if (lastSyncedBlock === latestBlock) {
      return;
    }
    let events: EventData[] = [];
    try {
      events = await this.WebaverseERC721Contract.getPastEvents('allEvents', {
        fromBlock: lastSyncedBlock + 1,
        toBlock: latestBlock,
      });
    } catch (error) {
      logger.error(error);
      return;
    }
    try {
      await this.storeMetadata(events);
    } catch (error) {
      logger.error(error);
      return;
    }
    await SyncConfigModel.findOneAndUpdate({ network: 'sidechain', task: 'syncWebaverseERC721' }, { lastSyncedBlock: latestBlock }, { upsert: true });
  };

  async getTokensByOwner(owner: string): Promise<INFTMetaData[]> {
    return await NFTMetadataModel.find({ owner, network: 'sidechain', contractAddress: config.blockchain.sidechain.ERC721Contract.address })
      .lean()
      .exec();
  }

  async getTokensByMinter(minter: string): Promise<INFTMetaData[]> {
    return await NFTMetadataModel.find({ minter, network: 'sidechain', contractAddress: config.blockchain.sidechain.ERC721Contract.address })
      .lean()
      .exec();
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

  private storeMetadata = async (events): Promise<any> => {
    for (const event of events) {
      const { tokenId, hash, key, value } = event.returnValues;
      if (tokenId) {
        const tokenSrc = await this.WebaverseERC721Contract.methods.tokenByIdFull(tokenId).call();
        const { hash, name, ext, minter, owner } = tokenSrc;
        await NFTMetadataModel.findOneAndUpdate(
          { tokenID: tokenId, network: 'sidechain', contractAddress: config.blockchain.sidechain.ERC721Contract.address },
          {
            network: 'sidechain',
            contractAddress: config.blockchain.sidechain.ERC721Contract.address,
            hash,
            name,
            ext,
            minter: `${minter}`.toLowerCase(),
            owner: `${owner}`.toLowerCase(),
          },
          { upsert: true },
        );
      } else if (hash && key && value) {
        const nft = await NFTMetadataModel.findOne({
          hash,
          network: 'sidechain',
          contractAddress: config.blockchain.sidechain.ERC721Contract.address,
        });
        if (nft) {
          nft[key] = value;
          await nft.save();
        }
      }
    }
  };
}

export default WebaverseERC721Service;

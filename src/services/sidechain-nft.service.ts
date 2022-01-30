import Web3 from 'web3';
import config from '@config/index';
import { EventData, Contract } from 'web3-eth-contract';
import { abi } from '@abi/WebaverseERC1155.json';
import fetch from 'node-fetch';
import NFTMetadataModel from '@models/nft-metadata.model';
import NFTOwnerModel from '@models/nft-owner.model';
import SyncConfigModel from '@/models/sync-config.model';

class SidechainNFTService {
  web3 = new Web3(config.blockchain.sidechain.url);
  WebaverseERC1155Contract: Contract;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {
    this.WebaverseERC1155Contract = new this.web3.eth.Contract(abi as any, config.blockchain.sidechain.ERC1155Contract.address);
  }

  getToken = async tokenId => {
    const metadataObj = await NFTMetadataModel.findOne({ tokenId, network: 'sidechain' });
    const balance = await this.WebaverseERC1155Contract.methods.getTokenBalance(tokenId).call();
    return {
      token_id: tokenId,
      metadata: metadataObj.metadata,
      balance: balance,
      asset_contract: {
        address: config.blockchain.sidechain.ERC1155Contract.address,
        asset_contract_type: 'semi-fungible',
        created_date: '2022-01-02T17:40:53.232025',
        name: 'Webaverse NFT',
        schema_name: 'ERC1155',
        symbol: 'Webaverse',
        description: 'Webaverse NFT contract',
        external_link: 'https://webaverse.com/',
        image_url: 'https://webaverse.com/imgs/logo.gif',
      },
    };
  };

  getTokensOfOwner = async owner => {
    const ownerTokens = await NFTOwnerModel.find({ address: owner, network: 'sidechain' });
    if (!ownerTokens) return [];

    const formatedTokens = [];

    for (const ownerToken of ownerTokens) {
      const { tokenId, balance } = ownerToken;
      const metadataObj = await NFTMetadataModel.findOne({ tokenId, network: 'sidechain' });
      formatedTokens.push({
        token_id: tokenId,
        metadata: metadataObj.metadata,
        balance: balance,
        asset_contract: {
          address: config.blockchain.sidechain.ERC1155Contract.address,
          asset_contract_type: 'semi-fungible',
          created_date: '2022-01-02T17:40:53.232025',
          name: 'Webaverse NFT',
          schema_name: 'ERC1155',
          symbol: 'Webaverse',
          description: 'Webaverse NFT contract',
          external_link: 'https://webaverse.com/',
          image_url: 'https://webaverse.com/imgs/logo.gif',
        },
      });
    }

    return formatedTokens;
  };

  syncNFTMetadata = async () => {
    let lastTokenIdSynced = 0;

    // Here syncConfig.lastSyncedBlock is used to get the last token id upto which the data is synced
    const syncConfig = await SyncConfigModel.findOne({ network: 'sidechain', task: 'syncSidechainNFTMetadata' });
    if (syncConfig && syncConfig.lastSyncedBlock && syncConfig.lastSyncedBlock > lastTokenIdSynced) {
      lastTokenIdSynced = syncConfig.lastSyncedBlock;
    }

    const currentTokenId = await this.WebaverseERC1155Contract.methods
      .currentTokenId()
      .call()
      .then(currentTokenId => Number.parseInt(currentTokenId));

    if (lastTokenIdSynced === currentTokenId) {
      return;
    }

    for (let i = lastTokenIdSynced + 1; i <= currentTokenId; i++) {
      const metadataURI = await this.WebaverseERC1155Contract.methods.uri(i).call();
      const metadata = await fetch(`http://localhost:${config.port}/nft/metadata/${metadataURI}`).then(response => response.json());
      await NFTMetadataModel.updateOne({ tokenId: `${i}`, network: 'sidechain' }, { metadata }, { upsert: true });
    }

    await SyncConfigModel.findOneAndUpdate(
      { network: 'sidechain', task: 'syncSidechainNFTMetadata' },
      { lastSyncedBlock: currentTokenId },
      { upsert: true },
    );
  };

  syncNFTOwners = async () => {
    let lastSyncedBlock = 0;
    const syncConfig = await SyncConfigModel.findOne({ network: 'sidechain', task: 'syncSidechainNFTOwners' });
    if (syncConfig && syncConfig.lastSyncedBlock && syncConfig.lastSyncedBlock > lastSyncedBlock) {
      lastSyncedBlock = syncConfig.lastSyncedBlock;
    }

    const latestBlock = await this.web3.eth.getBlockNumber();

    if (lastSyncedBlock === latestBlock) {
      return;
    }

    const events: EventData[] = await this.WebaverseERC1155Contract.getPastEvents('allEvents', {
      fromBlock: lastSyncedBlock + 1,
      toBlock: latestBlock,
    });

    for (const event of events) {
      if (event.event === 'TransferSingle') {
        const { from, to, id, value } = event.returnValues;
        await this.updateUserBalance(from, to, id, value);
      } else if (event.event === 'TransferBatch') {
        const { from, to, ids, values } = event.returnValues;
        for (let it = 0; it < ids.length; it++) {
          await this.updateUserBalance(from, to, ids[it], values[it]);
        }
      }
    }

    await SyncConfigModel.findOneAndUpdate(
      { network: 'sidechain', task: 'syncSidechainNFTOwners' },
      { lastSyncedBlock: latestBlock },
      { upsert: true },
    );
  };

  private updateUserBalance = async (from: string, to: string, id: string, value: string) => {
    if (from === '0x0000000000000000000000000000000000000000') {
      // Removing all the data of NFT id, If database is resyncing
      // Due to some error
      await NFTOwnerModel.remove({
        network: 'sidechain',
        tokenId: id,
      });

      // Creating the record for minting
      await NFTOwnerModel.updateOne(
        {
          address: to,
          network: 'sidechain',
          tokenId: id,
        },
        {
          balance: value,
        },
        {
          upsert: true,
        },
      );
    } else {
      // Reading the values from database and then subtracting and adding the values
      // Might make data inconsistent in case of a crash or unknown error
      // Therefore reading directly the latest balance from smart contract

      const [fromBalance, toBalance] = await this.WebaverseERC1155Contract.methods.balanceOfBatch([from, to], [id, id]).call();

      console.log({
        fromBalance,
        toBalance,
        tokenId: id,
      });

      try {
        if (fromBalance === '0') {
          await NFTOwnerModel.findOneAndRemove({ address: from, network: 'sidechain', tokenId: id });
        } else {
          await NFTOwnerModel.findOneAndUpdate(
            { address: from, network: 'sidechain', tokenId: id },
            {
              balance: fromBalance,
            },
          );
        }
        await NFTOwnerModel.findOneAndUpdate(
          { address: to, network: 'sidechain', tokenId: id },
          {
            balance: toBalance,
          },
          {
            upsert: true,
          },
        );
      } catch (error) {
        throw error;
      }
    }
  };
}

export default SidechainNFTService;

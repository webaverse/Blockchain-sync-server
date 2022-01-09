import Web3 from 'web3';
import config from '@config/index';
import { abi } from '@abi/Accounts.json';
import SyncConfigModel from '@/models/sync-config.model';
import { IAccountsValue } from '@/interfaces/accounts.interface';
import AccountsModel from '@models/accounts.model';

class AccountsService {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  async getAccountData(address: string) {
    const dataKeyValues: IAccountsValue[] = await AccountsModel.find({ owner: address });
    const data = {};

    for (let i = 0; i < dataKeyValues.length; i++) {
      const { key, value } = dataKeyValues[i];
      data[key] = value;
    }

    return data;
  }

  async syncAccounts() {
    const web3 = new Web3(config.blockchain.sidechain.url);
    const contract = new web3.eth.Contract(abi as any, config.blockchain.sidechain.AccountsContract.address);
    const lastSyncedBlock = await this.getLastBlock();
    const latestBlock = await web3.eth.getBlockNumber();

    if (lastSyncedBlock >= latestBlock) return;

    const metaDataEvents = await contract.getPastEvents('MetadataSet', {
      fromBlock: lastSyncedBlock + 1,
      toBlock: latestBlock,
    });
    const eventsReturnValues: IAccountsValue[] = metaDataEvents.map(event => {
      return {
        key: event.returnValues.key,
        owner: event.returnValues.owner.toLowerCase(),
        value: event.returnValues.value,
      };
    });

    for (let i = 0; i < eventsReturnValues.length; i++) {
      const { key, owner, value } = eventsReturnValues[i];
      if (key === '') {
        continue;
      }
      const accountKeyValue = await AccountsModel.findOne({ owner, key });
      if (accountKeyValue) {
        await accountKeyValue.update({ value });
      } else {
        await AccountsModel.create({ owner, key, value });
      }
    }
    await this.setLastSyncedBlock(latestBlock);
  }

  private async getLastBlock() {
    const syncConfig = await SyncConfigModel.findOne({ network: 'sidechain', task: 'syncAccounts' });
    let lastSyncedBlock = config.blockchain.sidechain.AccountsContract.startingBlock;
    if (syncConfig && syncConfig.lastSyncedBlock && syncConfig.lastSyncedBlock > lastSyncedBlock) {
      lastSyncedBlock = syncConfig.lastSyncedBlock;
    }
    return lastSyncedBlock;
  }

  private async setLastSyncedBlock(lastSyncedBlock: number) {
    await SyncConfigModel.findOneAndUpdate({ network: 'sidechain', task: 'syncAccounts' }, { lastSyncedBlock }, { upsert: true });
  }
}

export default AccountsService;

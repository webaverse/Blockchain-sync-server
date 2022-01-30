import cron from 'node-cron';
import SidechainNFTService from '@/services/sidechain-nft.service';

export class SidechainNFTJob {
  private isMetaDataSyncing = false;
  private isOwnersSyncing = false;

  private sidechainNftService = new SidechainNFTService();

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  async start() {
    cron.schedule('*/5 * * * * *', this.syncMetadata);
    cron.schedule('*/5 * * * * *', this.syncOwners);
  }

  syncMetadata = async () => {
    if (this.isMetaDataSyncing) {
      return;
    }
    this.isMetaDataSyncing = true;
    try {
      await this.sidechainNftService.syncNFTMetadata();
    } catch (error) {
      console.log(error);
    }
    this.isMetaDataSyncing = false;
  };

  syncOwners = async () => {
    if (this.isOwnersSyncing) {
      return;
    }
    this.isOwnersSyncing = true;
    try {
      await this.sidechainNftService.syncNFTOwners();
    } catch (error) {
      console.log(error);
    }
    this.isOwnersSyncing = false;
  };
}

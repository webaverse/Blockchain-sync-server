import WebaverseERC721Service from '@/services/nft.service';
import cron from 'node-cron';

export class WebaverseERC721Job {
  private isMetaDataSyncing = false;
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  async start() {
    cron.schedule('*/20 * * * * *', this.syncERC721Data);
  }

  async syncERC721Data() {
    if (this.isMetaDataSyncing) {
      console.log('Process already running');
      return;
    }
    this.isMetaDataSyncing = true;
    try {
      const erc721Service = new WebaverseERC721Service();
      await erc721Service.syncData();
    } catch (error) {
      console.log(error);
    }
    this.isMetaDataSyncing = false;
  }
}

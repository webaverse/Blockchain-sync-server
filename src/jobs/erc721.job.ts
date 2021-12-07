import ERC721Service from '@/services/erc721.service';
import cron from 'node-cron';
import config from 'config';

export class ERC721Job {
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
    const startingTime = new Date();
    try {
      const erc721Service = new ERC721Service();
      await erc721Service.storeMetadata();
      await erc721Service.syncTokenIDOwners();
    } catch (error) {
      console.log(error);
    }
    console.log(`Metadata sync completed in ${new Date().getTime() - startingTime.getTime()} ms`);
    this.isMetaDataSyncing = false;
  }
}

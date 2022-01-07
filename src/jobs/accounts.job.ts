import AccountsService from '@/services/accounts.service';
import cron from 'node-cron';

export class AccountsJob {
  private isAccountsSyncing = false;

  async start() {
    cron.schedule('*/10 * * * * *', this.syncAccountsData);
  }

  async syncAccountsData() {
    if (this.isAccountsSyncing) {
      return;
    }

    this.isAccountsSyncing = true;

    try {
      const accountsService = new AccountsService();
      await accountsService.syncAccounts();
    } catch (error) {
      console.log('error', error);
    } finally {
      this.isAccountsSyncing = false;
    }
  }
}

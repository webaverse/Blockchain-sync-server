import type { NextFunction, Request, Response } from 'express';
import AccountsService from '@services/accounts.service';
import Web3 from 'web3';
import { IAccount } from '@/interfaces/accounts.interface';

class AccountsController {
  private accountService: AccountsService = new AccountsService();

  public getAccountAgainstAddress = async (req: Request, res: Response, next: NextFunction) => {
    const { address } = req.params;

    if (!Web3.utils.isAddress(address)) {
      return res.status(400).json({
        message: 'Invalid address',
      });
    }
    const account: IAccount = (await this.accountService.getAccountData(address.toLowerCase())) as IAccount;
    try {
      res.json({
        address: address.toLowerCase(),
        name: account.name || '',
        avatarName: account.avatarName || '',
        avatarId: account.avatarId || '',
        avatarExt: account.avatarExt || '',
        homeSpaceExt: account.homeSpaceExt || '',
        addressProofs: account.addressProofs || '[]',
        homeSpaceName: account.homeSpaceName || '',
        homeSpacePreview: account.homeSpacePreview || '',
        ftu: account.ftu || '',
        avatarPreview: account.avatarPreview || '',
        loadout: account.loadout || '',
        homeSpaceId: account.homeSpaceId || '',
      });
    } catch (error) {
      next(error);
    }
  };

  public getAllAccounts = async (req: Request, res: Response, next: NextFunction) => {
    const accountData: IAccount[] = (await this.accountService.getAllAccounts()) as IAccount[];
    try {
      res.json(
        accountData.map(account => {
          return {
            address: account.address || '',
            name: account.name || '',
            avatarName: account.avatarName || '',
            avatarId: account.avatarId || '',
            avatarExt: account.avatarExt || '',
            homeSpaceExt: account.homeSpaceExt || '',
            addressProofs: account.addressProofs || '[]',
            homeSpaceName: account.homeSpaceName || '',
            homeSpacePreview: account.homeSpacePreview || '',
            ftu: account.ftu || '',
            avatarPreview: account.avatarPreview || '',
            loadout: account.loadout || '',
            homeSpaceId: account.homeSpaceId || '',
          };
        }),
      );
    } catch (error) {
      next(error);
    }
  };
}

export default AccountsController;

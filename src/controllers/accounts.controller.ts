import type { NextFunction, Request, Response } from 'express';
import AccountsService from '@services/accounts.service';
import Web3 from 'web3';

class AccountsController {
  private accountService: AccountsService = new AccountsService();

  public getAccountData = async (req: Request, res: Response, next: NextFunction) => {
    const { address } = req.params;

    if (!Web3.utils.isAddress(address)) {
      return res.status(400).json({
        message: 'Invalid address',
      });
    }
    const accountData = await this.accountService.getAccountData(address.toLowerCase());
    try {
      res.json(accountData);
    } catch (error) {
      next(error);
    }
  };
}

export default AccountsController;

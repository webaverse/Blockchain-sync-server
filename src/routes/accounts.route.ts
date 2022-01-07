import { Router } from 'express';
import AccountsController from '@/controllers/accounts.controller';
import { Routes } from '@interfaces/routes.interface';

class AccountsRoute implements Routes {
  public path = '/account';
  public router = Router();
  public accountsController = new AccountsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/:address`, this.accountsController.getAccountData);
  }
}

export default AccountsRoute;

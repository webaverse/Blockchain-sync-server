import { Router } from 'express';
import ERC721Controller from '@/controllers/ERC721.controller';
import { Routes } from '@interfaces/routes.interface';

class ERC721Route implements Routes {
  public path = '/webaverse-erc721';
  public router = Router();
  public erc721Controller = new ERC721Controller();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.erc721Controller.getTokensByOwner);
    this.router.get(`${this.path}/all`, this.erc721Controller.getAllTokens);
    this.router.get(`${this.path}/:tokenID`, this.erc721Controller.getTokenAgainstTokenID);
  }
}

export default ERC721Route;

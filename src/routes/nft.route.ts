import { Router } from 'express';
import NFTController from '@/controllers/nft.controller';
import { Routes } from '@interfaces/routes.interface';

class NFTRoute implements Routes {
  public path = '/nft';
  public router = Router();
  public nftController = new NFTController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.nftController.getTokensByOwner);
    this.router.get(`${this.path}/metadata/*`, this.nftController.getTokenMetaData);
    this.router.get(`${this.path}/:contractAddress/:tokenID`, this.nftController.getTokensByContractAddress);
  }
}

export default NFTRoute;

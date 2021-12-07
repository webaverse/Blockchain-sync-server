import { Router } from 'express';
import ERC721Controller from '@/controllers/ERC721.controller';
import { Routes } from '@interfaces/routes.interface';

class ERC721Route implements Routes {
  public path = '/erc721';
  public router = Router();
  public erc721Controller = new ERC721Controller();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.erc721Controller.index);
  }
}

export default ERC721Route;

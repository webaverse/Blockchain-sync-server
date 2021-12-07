import ERC721Service from '@/services/erc721.service';
import { NextFunction, Request, Response } from 'express';

class ERC721Controller {
  private erc721Service: ERC721Service = new ERC721Service();

  public index = async (req: Request, res: Response, next: NextFunction) => {
    const owner = `${req.query.owner}`.toLowerCase().trim();
    try {
      if (!owner) {
        return res.sendStatus(400);
      }
      const tokenIDs = await this.erc721Service.getTokenIDsByOwner(owner);
      console.log(tokenIDs);
      const metadata = await Promise.all(tokenIDs.map(async tokenID => this.erc721Service.getTokenMetadata(tokenID as string)));
      res.json(metadata);
    } catch (error) {
      next(error);
    }
  };
}

export default ERC721Controller;

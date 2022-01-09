// import ERC721Service from '@/services/erc721.service';
import { NextFunction, Request, Response } from 'express';

class ERC721Controller {
  // private erc721Service: ERC721Service = new ERC721Service();

  public getTokensByOwner = async (req: Request, res: Response, next: NextFunction) => {
    // const owner = `${req.query.owner}`.toLowerCase().trim();
    // const network = `${req.query.network}`.trim();
    // try {
    //   if (!owner) {
    //     return res.sendStatus(400);
    //   }
    //   const tokenIDs = await this.erc721Service.getTokenIDsByOwner(owner, network);
    //   console.log(tokenIDs);
    //   const metadata = await Promise.all(tokenIDs.map(async tokenID => this.erc721Service.getTokenMetadata(tokenID as string, network)));
    //   res.json(metadata);
    // } catch (error) {
    //   next(error);
    // }
  };

  getAllTokens = async (req: Request, res: Response) => {
    // const network = `${req.query.network}`.trim();
    // const start = `${req.query.start}`.trim();
    // const end = `${req.query.end}`.trim();
    // // check if start and end are valid numbers
    // if (start && Number.isInteger(Number(start)) && end && Number.isInteger(Number(end))) {
    //   try {
    //     let startN = Number(start);
    //     let endN = Number(end);
    //     if (startN > endN) {
    //       [startN, endN] = [endN, startN];
    //     }
    //     if (endN - startN > 100) {
    //       res.status(422);
    //       return;
    //     }
    //     const metadatas = await this.erc721Service.getTokensInIdRange(startN, endN, network);
    //     const ownerMetadata = [];
    //     for (const metadata of metadatas) {
    //       const owner = await this.erc721Service.getTokenOwner(metadata.tokenID, network);
    //       ownerMetadata.push({ ...metadata, owner });
    //     }
    //     res.json(ownerMetadata);
    //   } catch (error) {
    //     res.sendStatus(500);
    //   }
    // } else {
    //   try {
    //     const metadatas = await this.erc721Service.getAllTokenMetadata(network);
    //     res.json(metadatas);
    //   } catch (error) {
    //     res.sendStatus(500);
    //   }
    // }
  };

  public getTokenMetadata = async (req: Request, res: Response, next: NextFunction) => {
    // const tokenID = `${req.params.tokenID}`.trim();
    // const network = `${req.query.network}`.trim();
    // const owner = `${req.query.owner}`.toLowerCase().trim() === 'true';
    // try {
    //   if (!tokenID) {
    //     return res.sendStatus(400);
    //   }
    //   let metadata = await this.erc721Service.getTokenMetadata(tokenID, network);
    //   if (owner) {
    //     const ownerAddress = await this.erc721Service.getTokenOwner(tokenID, network);
    //     metadata = { ...metadata, owner: ownerAddress };
    //     console.log(metadata);
    //   }
    //   res.json(metadata);
    // } catch (error) {
    //   next(error);
    // }
  };
}

export default ERC721Controller;

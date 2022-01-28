import NFTService from '@/services/nft.service';
import MoralisService from '@/services/moralis.service';
import AccountsService from '@/services/accounts.service';
import { NextFunction, Request, Response } from 'express';
import Web3 from 'web3';

class NFTController {
  private nftService: NFTService = new NFTService();
  private moralisService: MoralisService = new MoralisService();
  private accountsService: AccountsService = new AccountsService();

  public getTokensByOwner = async (req: Request, res: Response, next: NextFunction) => {
    const owner = `${req.query.owner}`.toLowerCase().trim();
    const chainName = `${req.query.chainName}`.trim();
    if (!chainName || !['eth', 'polygon', 'sidechain'].includes(chainName)) {
      return res.status(400).send({
        message: 'Invalid chain name. chainName expected in query params. Valid values: eth, polygon, sidechain',
      });
    }
    try {
      if (!Web3.utils.isAddress(owner)) {
        return res.status(400).json({
          message: 'Invalid owner address. owner expected in query params. Valid values: 0x...',
        });
      }
      const tokens = await this.moralisService.getTokensByOwner(chainName, owner);
      res.json(tokens);
    } catch (error) {
      next(error);
    }
  };

  getTokensByContractAddress = async (req: Request, res: Response) => {
    const contractAddress = `${req.params.contractAddress}`.toLowerCase().trim();
    const tokenID = `${req.params.tokenID}`.trim();
    const chainName = `${req.query.chainName}`.trim();
    if (!chainName || !['eth', 'polygon', 'sidechain'].includes(chainName)) {
      return res.status(400).send({
        message: 'Invalid chain name. chainName expected in query params. Valid values: eth, polygon, sidechain',
      });
    }
    if (!Web3.utils.isAddress(contractAddress)) {
      return res.status(400).json({
        message: 'Invalid contract address',
      });
    }

    res.json({
      contractAddress,
      tokenID,
      chainName,
    });
  };
}

export default NFTController;

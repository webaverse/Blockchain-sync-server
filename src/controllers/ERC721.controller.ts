import ERC721Service from '@/services/webaverse-erc721.service';
import AccountsService from '@/services/accounts.service';
import { NextFunction, Request, Response } from 'express';
import Web3 from 'web3';

class ERC721Controller {
  private erc721Service: ERC721Service = new ERC721Service();
  private accountsService: AccountsService = new AccountsService();

  public getTokensByOwner = async (req: Request, res: Response, next: NextFunction) => {
    const owner = `${req.query.owner}`.toLowerCase().trim();
    try {
      if (!Web3.utils.isAddress(owner)) {
        return res.status(400).json({
          message: 'Invalid owner address',
        });
      }
      const tokens = await this.erc721Service.getTokensByOwner(owner);
      const formatedTokens = await Promise.all(tokens.map(token => this.formatToken(token)));
      res.json(formatedTokens);
    } catch (error) {
      next(error);
    }
  };

  getAllTokens = async (req: Request, res: Response) => {
    const start = `${req.query.start}`.trim();
    const end = `${req.query.end}`.trim();
    // check if start and end are valid numbers
    if (start && Number.isInteger(Number(start)) && end && Number.isInteger(Number(end))) {
      try {
        let startN = Number(start);
        let endN = Number(end);
        if (startN > endN) {
          [startN, endN] = [endN, startN];
        }
        if (endN - startN > 100) {
          res.status(422);
          return;
        }
        const tokens = await this.erc721Service.getTokensInIdRange(startN, endN);
        const formatedTokens = await Promise.all(tokens.map(token => this.formatToken(token)));
        res.json(formatedTokens);
      } catch (error) {
        res.sendStatus(500);
      }
    } else {
      try {
        const tokens = await this.erc721Service.getAllTokenMetadata();
        const formatedTokens = await Promise.all(tokens.map(token => this.formatToken(token)));
        res.json(formatedTokens);
      } catch (error) {
        res.sendStatus(500);
      }
    }
  };

  public getTokenAgainstTokenID = async (req: Request, res: Response, next: NextFunction) => {
    const tokenID = `${req.params.tokenID}`.trim();
    try {
      if (!tokenID) {
        return res.sendStatus(400);
      }
      const token = await this.erc721Service.getTokenMetadata(tokenID);
      const formatedToken = await this.formatToken(token);
      res.json(formatedToken);
    } catch (error) {
      next(error);
    }
  };

  private formatToken = async token => {
    const minterAddress = `${token.minter}`.toLowerCase().trim();
    const ownerAddress = `${token.owner}`.toLowerCase().trim();
    let owner: any = await this.accountsService.getAccountData(ownerAddress);
    if (!owner) {
      owner = {
        address: ownerAddress,
        avatarName: '',
        avatarId: '',
        avatarExt: '',
        avatarPreview: '',
        name: 'Anonymous',
        mainnetAddress: '',
        addressProofs: '[]',
        loadout: '',
      };
    } else {
      owner = {
        avatarName: owner.avatarName || '',
        avatarId: owner.avatarId || '',
        avatarExt: owner.avatarExt || '',
        avatarPreview: owner.avatarPreview || '',
        name: owner.name || 'Anonymous',
        mainnetAddress: owner.mainnetAddress || '',
        addressProofs: '[]',
        loadout: '',
        address: ownerAddress,
      };
    }
    let minter = await this.accountsService.getAccountData(minterAddress);
    if (!minter) {
      minter = {
        address: minterAddress,
        avatarName: '',
        avatarId: '',
        avatarExt: '',
        avatarPreview: '',
        name: 'Anonymous',
        mainnetAddress: '',
        addressProofs: '[]',
        loadout: '',
      };
    } else {
      minter = {
        avatarName: owner.avatarName || '',
        avatarId: owner.avatarId || '',
        avatarExt: owner.avatarExt || '',
        avatarPreview: owner.avatarPreview || '',
        name: owner.name || 'Anonymous',
        mainnetAddress: owner.mainnetAddress || '',
        addressProofs: '[]',
        loadout: '',
        address: minterAddress,
      };
    }
    return {
      id: token.tokenID || '',
      name: token.name || '',
      description: token.description || '',
      hash: token.hash || '',
      ext: token.ext || '',
      unlockable: '',
      encrypted: '',
      image: `https://preview.webaverse.com/${token.hash}.${token.ext}/preview.png`,
      external_url: `https://webaverse.com/assets/${token.tokenID}`,
      animation_url: token.animation_url || '',
      properties: {
        name: token.name || '',
        hash: token.hash || '',
        ext: token.ext || '',
        unlockable: '',
        encrypted: '',
      },
      minterAddress: token.minter.toLowerCase() || '',
      minter: minter,
      ownerAddress: token.owner.toLowerCase() || '',
      owner: owner,
      currentOwnerAddress: token.owner.toLowerCase() || '',
      balance: 1,
      totalSupply: 1,
      buyPrice: 0,
      storeId: '',
      currentLocation: token.network === 'sidechain' ? 'mainnetsidechain' : token.network,
      stuckTransactionHash: '',
    };
  };
}

export default ERC721Controller;

import MoralisService from '@/services/moralis.service';
import AccountsService from '@/services/accounts.service';
import { NextFunction, Request, Response } from 'express';
import Web3 from 'web3';
import isIPFS from 'is-ipfs';
import fetch from 'node-fetch';
import SidechainNFTService from '@/services/sidechain-nft.service';

class NFTController {
  private moralisService: MoralisService = new MoralisService();
  private accountsService: AccountsService = new AccountsService();
  private sidechainNFTService: SidechainNFTService = new SidechainNFTService();

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
      if (chainName === 'eth' || chainName === 'polygon') {
        // Get the data from Moralis
        const tokens = await this.moralisService.getTokensByOwner(chainName, owner);
        res.json(tokens);
      } else {
        // It's the sidechain request so get the data from database
        const tokens = await this.sidechainNFTService.getTokensOfOwner(owner);
        res.json(tokens);
      }
    } catch (error) {
      next(error);
    }
  };

  getToken = async (req: Request, res: Response) => {
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

    if (chainName === 'eth' || chainName === 'polygon') {
      // Get the data from Moralis
      const token = await this.moralisService.getToken(chainName, contractAddress, tokenID);
      res.json(token);
    } else {
      // It's the sidechain request so get the data from database
      const token = await this.sidechainNFTService.getToken(tokenID);
      res.json(token);
    }
  };

  getTokenMetaData = async (req: Request, res: Response) => {
    const { attributes: attrStr } = req.query;
    let attributes;
    try {
      attributes = JSON.parse(attrStr as string);
      if (!attributes) {
        attributes = [];
      }
    } catch (error) {
      attributes = [];
    }

    let extension = `${req.params[0]}`.split('.').pop();
    let file = `${req.params[0]}`.split('.').slice(0, -1).join('.');

    if (extension && !file) {
      file = extension;
      extension = '';
    } else {
      extension = extension.toLowerCase();
    }

    const metadata = {
      name: undefined,
      description: undefined,
      background_color: undefined,
      youtube_url: undefined,
      external_url: undefined,
      asset: undefined,
      animation_url: undefined,
      image: undefined,
      attributes,
    };

    metadata.name = file.split('/').pop();

    // if the file is not a complete url, we need to complete it
    if (file.startsWith('http')) {
      file = file + '.' + extension;
    } else if (isIPFS.ipfsPath(file)) {
      file = 'https://ipfs.webaverse.com' + file;
    } else if (isIPFS.cid(file)) {
      file = 'https://ipfs.webaverse.com/ipfs/' + file;
    } else if (isIPFS.cidPath(file)) {
      file = 'https://ipfs.webaverse.com/ipfs/' + file + '.' + extension;
    } else if (file.startsWith('ipfs://')) {
      file = file.replace('ipfs://', 'https://ipfs.webaverse.com/ipfs/');
    }

    if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(extension)) {
      metadata.image = file;
    } else if (['vrm', 'vox', 'js', 'scn', 'html', 'glb'].includes(extension)) {
      metadata.animation_url = file;
      metadata.asset = file;
    } else if (['mp4', 'webm', 'ogg', 'html'].includes(extension)) {
      metadata.animation_url = file;
    } else if (extension === 'metaversefile') {
      metadata.asset = file + '/.metaversefile';

      try {
        const metaversefile = await fetch(metadata.asset).then(res => res.json());
        metadata.name = metaversefile.name || metadata.name;
        metadata.description = metaversefile.description;
        metadata.background_color = metaversefile.background_color;
        metadata.youtube_url = metaversefile.youtube_url;
        metadata.external_url = metaversefile.external_url;
      } catch (error) {
        console.log(error.message);
      }
    } else {
      metadata.image = file;
      metadata.asset = file;
    }

    res.json(metadata);
  };
}

export default NFTController;

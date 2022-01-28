import { IMoralisNFTResponse } from '@/interfaces/moralis.interface';
import { INFT, INFTMetadata } from '@/interfaces/nft.interface';
import config from '@config/index';
import fetch from 'node-fetch';

class MoralisService {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  async getTokensByOwner(chainName: string, owner: string) {
    const nfts: IMoralisNFTResponse = await fetch(`${config.moralis.url}/${owner}/nft?chain=${chainName}&format=decimal`, {
      headers: {
        'X-API-Key': config.moralis.apiKey,
      },
    }).then(res => res.json());

    const contractAddressesToSync = new Set();
    nfts.result.filter(nft => !nft.synced_at).map(nfts => contractAddressesToSync.add(nfts.token_address));
    try {
      if (contractAddressesToSync.size > 0) {
        for (const contractAddress of contractAddressesToSync) {
          await fetch(`${config.moralis.url}/${owner}/nft/${contractAddress}/sync?chain=eth`, {
            method: 'PUT',
            headers: {
              'X-API-Key': config.moralis.apiKey,
            },
          });
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } catch (error) {
      console.log(error);
    }
    const formatedNFTs: INFT[] = [];
    for (let i = 0; i < nfts.result.length; i++) {
      let metadata: INFTMetadata = {};

      try {
        metadata = JSON.parse(nfts.result[i].metadata);
        if (!metadata) {
          metadata = {};
        }
      } catch (error) {
        metadata = {};
      }
      formatedNFTs.push({
        token_id: nfts.result[i].token_id,
        image_url: metadata.image || '',
        background_color: metadata.background_color || '',
        name: metadata.name || '',
        external_link: metadata.external_url || '',
        asset_contract: {
          address: nfts.result[i].token_address || '',
          name: nfts.result[i].name || '',
          symbol: nfts.result[i].symbol || '',
          image_url: metadata.image || '',
          description: metadata.description || '',
          external_link: metadata.external_url || '',
        },
        owner: {
          address: owner,
          user: {
            username: '',
          },
          config: '',
        },
        traits: metadata.attributes || [],
        last_sale: null,
      });
    }
    return formatedNFTs;
  }
}

export default MoralisService;

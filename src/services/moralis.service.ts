import { IMoralisNFTResponse, IMoralisNFTResult } from '@/interfaces/moralis.interface';
import { INFT, INFTMetadata } from '@/interfaces/nft.interface';
import config from '@config/index';
import fetch from 'node-fetch';

class MoralisService {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  async getToken(chainName, contractAddress, tokenId) {
    const nft: IMoralisNFTResult = await fetch(`${config.moralis.url}/nft/${contractAddress}/${tokenId}?chain=${chainName}&format=decimal`, {
      headers: {
        'X-API-Key': config.moralis.apiKey,
      },
    }).then(res => res.json());
    if (!nft.synced_at) {
      try {
        await fetch(`${config.moralis.url}/nft/${contractAddress}/sync?chain=eth`, {
          method: 'PUT',
          headers: {
            'X-API-Key': config.moralis.apiKey,
          },
        });
      } catch (error) {
        console.log(error);
      }
    }
    return this.formatNFTs({
      page: 1,
      page_size: 1,
      total: 1,
      result: [nft],
    });
  }

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
          await fetch(`${config.moralis.url}/nft/${contractAddress}/sync?chain=eth`, {
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
    return this.formatNFTs(nfts);
  }

  private formatNFTs(nfts: IMoralisNFTResponse) {
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
        metadata: metadata,
        balance: nfts.result[i].amount,
        asset_contract: {
          address: nfts.result[i].token_address || '',
          asset_contract_type: nfts.result[i].contract_type === 'ERC721' ? 'non-fungible' : 'semi-fungible',
          created_date: nfts.result[i].synced_at,
          name: nfts.result[i].name || '',
          schema_name: nfts.result[i].contract_type,
          symbol: nfts.result[i].symbol || '',
          image_url: metadata.image || '',
          description: metadata.description || '',
          external_link: metadata.external_url || '',
        },
      });
    }
    return formatedNFTs;
  }
}

export default MoralisService;

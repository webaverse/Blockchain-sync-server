interface INFTAssetContract {
  address: string;
  name: string;
  symbol: string;
  image_url: string;
  description: string;
  external_link: string;
}

interface INFTMetaDataTraits {
  trait_type: string;
  value: string;
  display_type?: string;
}

interface INFTAccount {
  address: string;
  user: {
    username: string;
  };
  config: string;
}

export interface INFTMetadata {
  image?: string;
  image_data?: string;
  external_url?: string;
  description?: string;
  name?: string;
  attributes?: INFTMetaDataTraits[];
  background_color?: string;
  animation_url?: string;
  youtube_url?: string;
  owner?: string;
  minter?: string;
  hash?: string;
  ext?: string;
}

export interface INFT {
  token_id: string;
  image_url: string;
  background_color: string;
  name: string;
  external_link: string;
  asset_contract: INFTAssetContract;
  owner: INFTAccount;
  traits: INFTMetaDataTraits[];
  last_sale: string;
}

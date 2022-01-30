interface INFTAssetContract {
  address: string;
  asset_contract_type: string;
  created_date: string;
  name: string;
  schema_name: string;
  symbol: string;
  description: string;
  external_link: string;
  image_url: string;
}

interface INFTMetaDataTraits {
  trait_type: string;
  value: string;
  display_type?: string;
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
  asset?: string;
}

export interface INFT {
  token_id: string;
  metadata: INFTMetadata;
  balance: string;
  asset_contract: INFTAssetContract;
}

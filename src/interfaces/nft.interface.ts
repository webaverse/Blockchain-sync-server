export interface INFTMetadataAttribute {
  trait_type: string;
  trait_value: string;
  display_type?: string;
}

export interface INFTMetaDataRequest {
  image?: string;
  image_data?: string;
  external_url?: string;
  description?: string;
  name?: string;
  attributes?: INFTMetadataAttribute[];
  background_color?: string;
  animation_url?: string;
  youtube_url?: string;
  owner?: string;
  minter?: string;
  hash?: string;
  ext?: string;
}

export interface INFTMetaData extends INFTMetaDataRequest {
  tokenID: string;
  network: string;
  contractAddress: string;
}

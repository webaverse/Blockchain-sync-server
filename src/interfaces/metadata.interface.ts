export interface IMetadataAttribute {
  trait_type: string;
  trait_value: string;
  display_type?: string;
}

export interface IMetaDataRequest {
  image?: string;
  image_data?: string;
  external_url?: string;
  description?: string;
  name?: string;
  attributes?: IMetadataAttribute[];
  background_color?: string;
  animation_url?: string;
  youtube_url?: string;
  hash?: string;
  ext?: string;
}

export interface IMetaData {
  tokenID: string;
  uri: string;
  image?: string;
  image_data?: string;
  external_url?: string;
  description?: string;
  name?: string;
  attributes?: IMetadataAttribute[];
  background_color?: string;
  animation_url?: string;
  youtube_url?: string;
  network: string;
  hash?: string;
  ext?: string;
  owner?: string;
}

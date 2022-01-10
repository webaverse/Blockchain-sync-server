import { INFTMetaData } from '@/interfaces/nft.interface';
import { model, Schema, Document } from 'mongoose';

const metadataSchema: Schema = new Schema({
  tokenID: {
    type: String,
    required: true,
    unique: true,
  },
  network: {
    type: String,
    enum: ['polygon', 'sidechain'],
    required: true,
  },
  contractAddress: {
    type: String,
    required: true,
  },
  uri: {
    type: String,
  },
  image: String,
  image_data: String,
  external_url: String,
  description: String,
  name: String,
  attributes: [
    {
      trait_type: {
        type: String,
      },
      value: {
        type: String,
      },
      display_type: String,
    },
  ],
  owner: String,
  minter: String,
  background_color: String,
  animation_url: String,
  youtube_url: String,
  hash: String,
  ext: String,
});

const NFTMetadataModel = model<INFTMetaData & Document>('NFTMetadata', metadataSchema);

export default NFTMetadataModel;

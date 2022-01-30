import { INFTMetadata } from '@/interfaces/nft.interface';
import { model, Schema, Document } from 'mongoose';

interface INFTMetadataModel extends Document {
  tokenId: string;
  network: string;
  metadata: INFTMetadata;
}

const metadataSchema: Schema = new Schema({
  tokenId: {
    type: String,
    required: true,
    unique: true,
  },
  network: {
    type: String,
    enum: ['polygon', 'sidechain'],
    required: true,
  },
  metadata: {
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
    background_color: String,
    animation_url: String,
    youtube_url: String,
    asset: String,
  },
});

const NFTMetadataModel = model<INFTMetadataModel>('NFTMetadata', metadataSchema);

export default NFTMetadataModel;

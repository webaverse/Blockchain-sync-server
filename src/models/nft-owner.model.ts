import { model, Schema, Document } from 'mongoose';

export interface INFTOwnerModel extends Document {
  address: string;
  network: string;
  tokenId: string;
  balance: string;
}

const nftOwnerSchema: Schema = new Schema({
  address: {
    type: String,
    lowercase: true,
    trim: true,
    required: true,
  },
  network: {
    type: String,
    required: true,
  },
  tokenId: {
    type: String,
    required: true,
  },
  balance: {
    type: String,
    required: true,
  },
});

const NFTOwnerModel = model<INFTOwnerModel>('NFTOwners', nftOwnerSchema);

export default NFTOwnerModel;

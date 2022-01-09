import { model, Schema, Document } from 'mongoose';
import { ITokenOwner } from '@interfaces/token-owner.interface';

const sidechainERC721tokenOwnerSchema: Schema = new Schema({
  tokenID: {
    type: String,
    required: true,
  },
  owner: {
    type: String,
    required: true,
  },
  minter: String,
});

const SidechainERC721TokenOwnerModel = model<ITokenOwner & Document>('SidechainERC721TokenOwner', sidechainERC721tokenOwnerSchema);

export default SidechainERC721TokenOwnerModel;

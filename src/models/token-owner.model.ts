import { model, Schema, Document } from 'mongoose';
import { ITokenOwner } from '@interfaces/token-owner.interface';

const tokenOwnerSchema: Schema = new Schema({
  tokenID: String,
  owner: String,
});

const TokenOwnerModel = model<ITokenOwner & Document>('TokenOwner', tokenOwnerSchema);

export default TokenOwnerModel;

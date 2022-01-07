import { model, Schema, Document } from 'mongoose';
import { IAccountsValue } from '@interfaces/accounts.interface';

const accountsSchema: Schema = new Schema({
  key: {
    type: String,
    required: true,
  },
  owner: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    default: '',
  },
});

const AccountsModel = model<IAccountsValue & Document>('Accounts', accountsSchema);

export default AccountsModel;

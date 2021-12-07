import { model, Schema, Document } from 'mongoose';
import { ISyncConfig } from '@interfaces/sync-config.interface';

const syncConfigSchema: Schema = new Schema({
  network: {
    type: String,
    required: true,
  },
  task: {
    type: String,
    required: true,
  },
  lastSyncedBlock: {
    type: Number,
    default: 0,
  },
});

syncConfigSchema.index({ network: 1, task: 1 }, { unique: true });

const SyncConfigModel = model<ISyncConfig & Document>('SyncConfig', syncConfigSchema);

export default SyncConfigModel;

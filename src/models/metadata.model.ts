import { model, Schema, Document } from 'mongoose';
import { IMetaData } from '@interfaces/metadata.interface';

const metadataSchema: Schema = new Schema({
  tokenID: {
    type: String,
    required: true,
    unique: true,
  },
  uri: {
    type: String,
    required: true,
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
        required: true,
      },
      value: {
        type: String,
        required: true,
      },
      display_type: String,
    },
  ],
  background_color: String,
  animation_url: String,
  youtube_url: String,
});

const MetadataModel = model<IMetaData & Document>('Metadata', metadataSchema);

export default MetadataModel;

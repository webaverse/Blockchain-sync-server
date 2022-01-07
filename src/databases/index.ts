import config from '@config/index';
import { dbConfig } from '@interfaces/db.interface';

const { host, port, database }: dbConfig = config.dbConfig;

export const dbConnection = {
  url: `mongodb://${host}:${port}/${database}`,
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  },
};

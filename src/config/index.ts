import 'dotenv/config';

export default {
  env: process.env.NODE_ENV,
  dbConfig: {
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    port: Number.parseInt(process.env.DB_PORT),
  },
  log: {
    format: 'combined',
    dir: '../logs',
  },
  cors: {
    origin: true,
    credentials: true,
  },
  blockchain: {
    sidechain: {
      url: process.env.SIDECHAIN_URL,
      ERC721Contract: {
        address: '0x1EB475A4510536cb26d3AF9e545436ae18ef1Ad6',
        startingBlock: 0,
      },
      AccountsContract: {
        address: '0xEE64CB0278f92a4A20cb8F2712027E89DE0eB85e',
        startingBlock: 0,
      },
    },
  },
};

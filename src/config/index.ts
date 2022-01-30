import 'dotenv/config';

export default {
  port: process.env.PORT || 3000,
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
  moralis: {
    url: 'https://deep-index.moralis.io/api/v2',
    apiKey: process.env.MORALIS_WEB3_API_KEY,
  },
  blockchain: {
    sidechain: {
      url: process.env.SIDECHAIN_URL,
      ERC1155Contract: {
        address: '0x06bd28FBc5181dc24D2cD00d64FC12291626c2a2',
        startingBlock: 0,
      },
      AccountsContract: {
        address: '0xEE64CB0278f92a4A20cb8F2712027E89DE0eB85e',
        startingBlock: 0,
      },
    },
  },
};

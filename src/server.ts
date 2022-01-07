process.env['NODE_CONFIG_DIR'] = __dirname + '/configs';

import App from '@/app';
import validateEnv from '@utils/validateEnv';
import ERC721Route from './routes/ERC721.route';
// import { ERC721Job } from '@jobs/erc721.job';
import { AccountsJob } from '@jobs/accounts.job';
import AccountsRoute from './routes/accounts.route';

validateEnv();

const app = new App([new ERC721Route(), new AccountsRoute()], [new AccountsJob()]);

app.listen();

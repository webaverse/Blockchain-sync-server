process.env['NODE_CONFIG_DIR'] = __dirname + '/configs';

import App from '@/app';
import validateEnv from '@utils/validateEnv';
import NFTRoute from './routes/nft.route';
import IndexRoute from './routes/index.route';
import { AccountsJob } from '@jobs/accounts.job';
import { SidechainNFTJob } from '@jobs/sidechain-nft.job';
import AccountsRoute from './routes/accounts.route';

validateEnv();

const routes = [new IndexRoute(), new NFTRoute(), new AccountsRoute()];
const jobs = [new SidechainNFTJob(), new AccountsJob()];

const app = new App(routes, jobs);

app.listen();

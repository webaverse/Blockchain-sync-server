process.env['NODE_CONFIG_DIR'] = __dirname + '/configs';

import App from '@/app';
import validateEnv from '@utils/validateEnv';
import ERC721Route from './routes/ERC721.route';
import { WebaverseERC721Job } from '@jobs/webaverse-erc721.job';
import { AccountsJob } from '@jobs/accounts.job';
import AccountsRoute from './routes/accounts.route';

validateEnv();

const app = new App([new ERC721Route(), new AccountsRoute()], [new AccountsJob(), new WebaverseERC721Job()]);

app.listen();

process.env['NODE_CONFIG_DIR'] = __dirname + '/configs';

import 'dotenv/config';
import App from '@/app';
import validateEnv from '@utils/validateEnv';
import ERC721Route from './routes/ERC721.route';
import { ERC721Job } from '@jobs/erc721.job';

validateEnv();

const app = new App([new ERC721Route()], [new ERC721Job()]);

app.listen();

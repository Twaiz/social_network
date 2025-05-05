import { bootstrap } from '@bootstrap';
import { GetEnv } from '@get-env';
import { TwoFaModule } from '@two-fa-lib';

const twoFaPort = process.env.TWO_FA_SERVER_PORT;
const port = GetEnv.getServerPort(twoFaPort);

bootstrap<TwoFaModule>(TwoFaModule, port);

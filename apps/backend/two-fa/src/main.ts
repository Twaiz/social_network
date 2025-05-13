import { GetEnv, bootstrap } from '@shared';
import { TwoFaModule } from '@features/two-fa';

const twoFaPort = process.env.TWO_FA_SERVER_PORT;
const port = GetEnv.getServerPort(twoFaPort);

bootstrap<TwoFaModule>(TwoFaModule, port);

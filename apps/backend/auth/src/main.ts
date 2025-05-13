import { GetEnv, bootstrap } from '@shared';
import { AuthModule } from '@features/auth';

const authPort = process.env.AUTH_SERVER_PORT;
const port = GetEnv.getServerPort(authPort);

bootstrap<AuthModule>(AuthModule, port);

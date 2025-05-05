import { bootstrap } from '@bootstrap';
import { AuthModule } from '@auth-lib';
import { GetEnv } from '@get-env';

const authPort = process.env.AUTH_SERVER_PORT;
const port = GetEnv.getServerPort(authPort);

bootstrap<AuthModule>(AuthModule, port);

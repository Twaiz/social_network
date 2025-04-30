import { bootstrap } from '@bootstrap';
import { AuthModule } from '@auth-lib';
import { GetEnv } from '@get-env';

const customPort = process.env.AUTH_SERVER_PORT;
const port = GetEnv.getServerPort(customPort);

bootstrap(AuthModule, port);

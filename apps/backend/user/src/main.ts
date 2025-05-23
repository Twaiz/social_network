import { bootstrap, GetEnv } from '@shared';
import { UserModule } from '@features/user';

const userPort = process.env.USER_SERVER_PORT;
const port = GetEnv.getServerPort(userPort);

bootstrap<UserModule>(UserModule, port);

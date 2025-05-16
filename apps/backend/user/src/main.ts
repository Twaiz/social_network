import { bootstrap, GetEnv } from '@shared';

const userPort = process.env.USER_SERVER_PORT;
const port = GetEnv.getServerPort(userPort);

// bootstrap()

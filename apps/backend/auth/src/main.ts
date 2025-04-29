import { Logger } from '@nestjs/common';

import { bootstrap } from '@bootstrap';
import { AuthModule } from '@auth-lib';
import { SERVER_PORT_NOT_FOUND } from '@shared';

const port = Number(process.env.AUTH_SERVER_PORT);
if (!port) {
  Logger.log(SERVER_PORT_NOT_FOUND);
  process.exit(1);
}

bootstrap(AuthModule, port);

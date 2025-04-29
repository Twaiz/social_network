import { Logger } from '@nestjs/common';

import { bootstrap } from '@bootstrap';
import { TwoFaModule } from '@two-fa-lib';
import { SERVER_PORT_NOT_FOUND } from '@shared';

const port = Number(process.env.PORT);
if (!port) {
  Logger.log(SERVER_PORT_NOT_FOUND);
  process.exit(1);
}

bootstrap(TwoFaModule, port);

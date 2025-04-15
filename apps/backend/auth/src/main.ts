import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AuthModule } from './auth/auth.module';
import {
  SERVER_CONNECTION_FAILED,
  SERVER_CONNECTION_SUCCESS,
} from './main.constants';

async function bootstrap() {
  const host = process.env.SERVER_HOST || 'localhost';
  const globalPrefix = process.env.SERVER_GLOBAL_PREFIX || 'api';
  const port = process.env.SERVER_PORT || 3000;

  try {
    const app = await NestFactory.create(AuthModule);

    app.setGlobalPrefix(globalPrefix);
    await app.listen(port);

    Logger.log(
      `${SERVER_CONNECTION_SUCCESS}: http://${host}:${port}/${globalPrefix}`,
    );
  } catch (error) {
    if (!(error instanceof Error)) return;

    Logger.error(SERVER_CONNECTION_FAILED, error.stack, 'Bootstrap');
    process.exit(1);
  }
}

bootstrap();

import { NestFactory } from '@nestjs/core';
import {
  DynamicModule,
  ForwardReference,
  INestApplication,
  Logger,
  Type,
  ValidationPipe,
} from '@nestjs/common';

import {
  SERVER_CONNECTION_FAILED,
  SERVER_CONNECTION_SUCCESS,
} from './constant';
import { GetEnv } from '../get-env';

export type IEntryNestModule =
  | Type
  | DynamicModule
  | ForwardReference
  | Promise<Type | DynamicModule | ForwardReference>;

export async function bootstrap<T>(
  module: IEntryNestModule,
  customPort: string,
): Promise<INestApplication<T> | null> {
  const { port, host, globalPrefix } =
    GetEnv.getMongodbConnectionParametrs(customPort);

  try {
    const app = await NestFactory.create(module);

    app.setGlobalPrefix(globalPrefix);
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.listen(customPort);

    Logger.log(
      `${SERVER_CONNECTION_SUCCESS}: http://${host}:${port}/${globalPrefix}`,
      'Bootstrap',
    );

    return app;
  } catch (error) {
    if (!(error instanceof Error)) return null;

    Logger.error(SERVER_CONNECTION_FAILED, error.stack, 'Bootstrap');
    process.exit(1);
  }
}

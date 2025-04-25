import { NestFactory } from '@nestjs/core';
import { DynamicModule, ForwardReference, Logger, Type } from '@nestjs/common';
import {
  SERVER_CONNECTION_FAILED,
  SERVER_CONNECTION_SUCCESS,
} from './bootstrap.constants';

type IEntryNestModule =
  | Type
  | DynamicModule
  | ForwardReference
  | Promise<IEntryNestModule>;

export async function bootstrap(module: IEntryNestModule): Promise<void> {
  const host = process.env.SERVER_HOST || 'localhost';
  const globalPrefix = process.env.SERVER_GLOBAL_PREFIX || 'api';
  const port = process.env.SERVER_PORT || 3000;

  try {
    const app = await NestFactory.create(module);

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

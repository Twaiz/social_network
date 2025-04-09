import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);

  const globalPrefix = 'api';
  const port = process.env.SERVER_PORT || 3000;

  app.setGlobalPrefix(globalPrefix);
  await app.listen(port);

  Logger.log(`🚀 Проект запущен: http://localhost:${port}/${globalPrefix}`);
}

bootstrap();

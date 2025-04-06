import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const globalPrefix = 'api';
  const port = process.env.PORT || 3000;

  app.setGlobalPrefix(globalPrefix);
  await app.listen(port);

  Logger.log(`🚀 Проект запущен: http://localhost:${port}/${globalPrefix}`);
}

bootstrap();

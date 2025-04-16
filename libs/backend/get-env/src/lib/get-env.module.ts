import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { GetEnvService } from './get-env.service';

@Module({
  imports: [ConfigModule],
  providers: [GetEnvService],
  exports: [GetEnvService],
})
export class GetEnvModule {}

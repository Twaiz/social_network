import { Module } from '@nestjs/common';
import { TwoFaController } from './two-fa.controller';

@Module({
  controllers: [TwoFaController],
})
export class TwoFaModule {}

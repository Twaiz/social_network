import { Module } from '@nestjs/common';

import { TwoFaController } from '@controllers';
import { TwoFaService } from '@services';

import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [TwoFaController],
  providers: [TwoFaService],
})
export class TwoFaModule {}

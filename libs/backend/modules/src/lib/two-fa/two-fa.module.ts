import { forwardRef, Module } from '@nestjs/common';

import { TwoFaController } from '@controllers';
import { TwoFaService } from '@services';

import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [TwoFaController],
  providers: [TwoFaService],
  exports: [TwoFaService],
})
export class TwoFaModule {}

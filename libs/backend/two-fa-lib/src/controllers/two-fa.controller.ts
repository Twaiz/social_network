import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { SUCCESS_2FA_ENABLED } from '../two-fa.constants';
import { TwoFaService } from '../services/two-fa.service';
import { Enable2FADto } from '../dtos/enable-2FA.dto';

import { JwtAuthGuard, type AuthenticatedRequest } from '@shared';

@Controller('two-fa')
export class TwoFaController {
  constructor(private readonly twoFaService: TwoFaService) {}

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  async generate2FASecret(@Req() req: AuthenticatedRequest): Promise<{
    secret: string;
    otpauthUrl: string;
    qrCodeDataUrl: string;
  }> {
    return this.twoFaService.generateTwoFactorSecret(req.user);
  }

  @HttpCode(200)
  @Post('enable')
  @UseGuards(JwtAuthGuard)
  async enable2FA(
    @Req() req: AuthenticatedRequest,
    @Body() { code }: Enable2FADto,
  ): Promise<{
    message: string;
  }> {
    await this.twoFaService.enableTwoFactor(req.user, code);

    return { message: SUCCESS_2FA_ENABLED };
  }
}

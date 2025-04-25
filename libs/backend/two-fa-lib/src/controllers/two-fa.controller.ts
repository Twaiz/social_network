import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';

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
    const user = req.user;

    return this.twoFaService.generateTwoFactorSecret(user);
  }

  @Post('enable')
  @UseGuards(JwtAuthGuard)
  async enable2FA(
    @Req() req: AuthenticatedRequest,
    @Body() token: Enable2FADto,
  ): Promise<{
    status: string;
    code: number;
    message: string;
  }> {
    const { code } = token;
    const user = req.user;

    return this.twoFaService.enableTwoFactor(user, code);
  }
}

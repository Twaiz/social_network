import { BadRequestException, Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import * as qrcode from 'qrcode';

import { IUser } from '@interfaces';
import { AuthService } from '../auth/auth.service';
import { INVALID_2FA_CODE } from './two-fa.constants';

@Injectable()
export class TwoFaService {
  constructor(private readonly userService: AuthService) {}

  async generateTwoFactorSecret(user: IUser): Promise<{
    secret: string;
    otpauthUrl: string;
    qrCodeDataUrl: string;
  }> {
    const serviceName = 'SocialNetwork';

    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(user.email, serviceName, secret);
    const qrCodeDataUrl = await qrcode.toDataURL(otpauthUrl);

    await this.userService.updateTwoFactorSecret(user._id, secret);

    return {
      secret,
      otpauthUrl,
      qrCodeDataUrl,
    };
  }

  async enableTwoFactor(
    user: IUser,
    code: string,
  ): Promise<{
    status: string;
    code: number;
    message: string;
  }> {
    this.verifyTwoFactorCode(user, code);

    await this.userService.updateTwoFactorEnable(user._id);

    return {
      status: 'success',
      code: 200,
      message: '✅ 2FA Успешно вклюёчена',
    };
  }

  async verifyTwoFactorCode(user: IUser, code: string): Promise<void> {
    const isTwoFactorCodeValid = authenticator.verify({
      token: code,
      secret: user.twoFactorSecret,
    });

    if (!isTwoFactorCodeValid) {
      throw new BadRequestException(INVALID_2FA_CODE);
    }
  }
}

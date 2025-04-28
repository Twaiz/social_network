import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { authenticator } from 'otplib';
import * as qrcode from 'qrcode';

import { INVALID_2FA_CODE } from '../two-fa.constants';

import { findUserByEmail, IUser } from '@shared';
// import { USER_NOT_FOUND } from 'libs/backend/shared/src/strategies/strategies.constants'; //TODO сделать global constants
export const USER_NOT_FOUND = '❌ Пользователь не найден';

@Injectable()
export class TwoFaService {
  constructor(@InjectModel('User') private readonly userModel: Model<IUser>) {}

  async generateTwoFactorSecret(user: IUser): Promise<{
    secret: string;
    otpauthUrl: string;
    qrCodeDataUrl: string;
  }> {
    const serviceName = 'SocialNetwork';

    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(user.email, serviceName, secret);
    const qrCodeDataUrl = await qrcode.toDataURL(otpauthUrl);

    await this.userModel.findByIdAndUpdate(user._id, {
      twoFactorSecret: secret,
    });

    return {
      secret,
      otpauthUrl,
      qrCodeDataUrl,
    };
  }

  async enableTwoFactor(user: IUser, code: string): Promise<void> {
    const userWithTwoFactorSecret = await findUserByEmail(
      this.userModel,
      user.email,
      '+twoFactorSecret',
    );
    if (!userWithTwoFactorSecret) {
      throw new NotFoundException(USER_NOT_FOUND);
    }

    this.verifyTwoFactorCode(userWithTwoFactorSecret, code);

    Logger.log('user', user);
    Logger.log('userWithTwoFactorSecret', userWithTwoFactorSecret);

    await this.userModel.findByIdAndUpdate(userWithTwoFactorSecret._id, {
      isTwoFactorEnabled: true,
    });
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

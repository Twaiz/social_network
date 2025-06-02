import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { authenticator } from 'otplib';
import * as qrcode from 'qrcode';

import { IUser, USER_NOT_FOUND, findUser, verifyTwoFactorCode } from '@shared';

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
    const userWithTwoFactorSecret = await findUser.byEmail(
      this.userModel,
      user.email,
      USER_NOT_FOUND,
      '+twoFactorSecret',
    );
    if (!userWithTwoFactorSecret) {
      throw new NotFoundException(USER_NOT_FOUND);
    }

    verifyTwoFactorCode(userWithTwoFactorSecret, code);

    await this.userModel.findByIdAndUpdate(userWithTwoFactorSecret._id, {
      isTwoFactorEnabled: true,
    });
  }
}

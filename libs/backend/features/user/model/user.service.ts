import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { addHours } from 'date-fns';
import { randomBytes } from 'node:crypto';

import {
  IUser,
  USER_ALREADY_REGISTERED_WITH_LOGIN,
  USER_NOT_FOUND,
  NewUserInfoCredentialsDto,
  findUserByEmail,
  USER_ALREADY_REGISTERED_WITH_EMAIL,
  sendEmail,
} from '@shared';

import { ChangeEmailCredentialsDto } from '../dto';
import { IDENTICAL_EMAIL } from './constant';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<IUser>,
    private readonly configService: ConfigService,
  ) {}

  async updateUserInfo(
    user: IUser,
    newUserInfoCredentialsDto: NewUserInfoCredentialsDto,
  ): Promise<IUser> {
    const { login, firstName, secondName } = newUserInfoCredentialsDto;

    if (login && login !== user.login) {
      const loginTaken = await this.userModel.findOne({ login });
      if (loginTaken) {
        throw new BadRequestException(USER_ALREADY_REGISTERED_WITH_LOGIN);
      }
    }

    const updatedUser = await this.userModel.findByIdAndUpdate(
      user._id,
      {
        login: login ?? user.login,
        firstName: firstName ?? user.firstName,
        secondName: secondName ?? user.secondName,
      },
      { new: true },
    );

    if (!updatedUser) {
      throw new NotFoundException(USER_NOT_FOUND);
    }

    return updatedUser;
  }

  async changeEmail(
    user: IUser,
    changeEmailCredentialsDto: ChangeEmailCredentialsDto,
  ): Promise<void> {
    const currentEmail = user.email;
    const { newEmail } = changeEmailCredentialsDto;

    if (newEmail === user.email) {
      throw new BadRequestException(IDENTICAL_EMAIL);
    }

    const userWithSuchEmail = await findUserByEmail(this.userModel, newEmail);
    if (userWithSuchEmail) {
      throw new BadRequestException(USER_ALREADY_REGISTERED_WITH_EMAIL);
    }

    const changeEmailToken = randomBytes(32).toString('hex');
    const changeEmailExpires = addHours(new Date(), 24);
    const userByChangeEmail = await this.userModel.findByIdAndUpdate(
      user._id,
      {
        changeEmailToken,
        changeEmailNew: newEmail,
        changeEmailExpires,
      },
      { new: true },
    );
    if (!userByChangeEmail) {
      throw new NotFoundException(USER_NOT_FOUND);
    }

    const confirmationUrl = `https://social-network.com/confirm-email?token=${changeEmailToken}`;
    const htmlContent = `
    <p>Здравствуйте, ${user.firstName}${user.secondName}!</p>
    <p>Вы запросили смену email на <strong>${newEmail}</strong>.</p>
    <p>Если вы действительно хотите изменить свой адрес, пожалуйста, подтвердите действие, перейдя по следующей ссылке:</p>
    <p><a href="${confirmationUrl}">${confirmationUrl}</a></p>
    <p>Ссылка действительна в течение 24 часов.</p>
    <p><strong>Если вы не запрашивали изменение, просто проигнорируйте это письмо!</strong></p>
  `;

    await sendEmail(
      this.configService,
      'Подтверждение смены email',
      htmlContent,
      currentEmail,
    );
  }
}

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

import {
  CHANGE_EMAIL_TOKEN_NOT_FOUND,
  CONFIRM_CHANGE_EMAIL_TOKEN_INVALID,
  IDENTICAL_EMAIL,
} from './constant';
import { sendEmailChangeConfirm } from './lib';

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

  async changeEmail(user: IUser, newEmail: string): Promise<void> {
    const currentEmail = user.email;

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

    //TODO - вынести в отдельную функцию, как в confirmChangedEmail
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

  async confirmChangedEmail(changeEmailToken: string): Promise<void> {
    const userByChangeEmail = await this.userModel.findOne({
      changeEmailToken,
      changeEmailExpires: { $gt: new Date() },
    });
    if (!userByChangeEmail) {
      throw new BadRequestException(CONFIRM_CHANGE_EMAIL_TOKEN_INVALID);
    }

    const newEmail = userByChangeEmail.changeEmailNew;
    const oldEmail = userByChangeEmail.email;
    const fullName = `${userByChangeEmail.firstName} ${userByChangeEmail.secondName}`;

    if (!newEmail) {
      throw new NotFoundException(CHANGE_EMAIL_TOKEN_NOT_FOUND);
    }

    await this.userModel.findOneAndUpdate(
      { _id: userByChangeEmail._id },
      {
        email: newEmail,

        changeEmailToken: null,
        changeEmailExpires: null,
        changeEmailNew: null,
      },
      { new: true },
    );

    await sendEmailChangeConfirm(
      this.configService,
      oldEmail,
      newEmail,
      fullName,
    );
  }

  //TODO - добавить методы для Admin-а. CUD - Create, Update, Delete
}

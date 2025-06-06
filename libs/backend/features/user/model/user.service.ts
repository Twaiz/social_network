import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { addHours } from 'date-fns';
import { randomBytes } from 'node:crypto';
import { genSaltSync, hashSync } from 'bcryptjs';

import {
  IUser,
  USER_ALREADY_REGISTERED_WITH_LOGIN,
  USER_NOT_FOUND,
  NewUserInfoCredentialsDto,
  USER_ALREADY_REGISTERED_WITH_EMAIL,
} from '@shared';

import {
  CHANGE_EMAIL_TOKEN_NOT_FOUND,
  CONFIRM_CHANGE_TOKEN_INVALID,
  IDENTICAL_PASSWORD,
} from './constant';

// import {
//   changeEmail,
//   confirmNewEmail,
//   changePassword,
//   confirmNewPassword,
// } from './lib';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<IUser>,
    // private readonly configService: ConfigService,
  ) {}

  async updateUserInfo(
    user: IUser,
    newUserInfoCredentials: NewUserInfoCredentialsDto,
  ): Promise<IUser> {
    const { login, firstName, secondName } = newUserInfoCredentials;

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
    // const currentEmail = user.email;

    const userWithSuchEmail = await this.userModel.findOne({ email: newEmail });

    if (userWithSuchEmail) {
      Logger.log(
        USER_ALREADY_REGISTERED_WITH_EMAIL,
        'ChangeEmail - userWithSuchEmail',
      );
      throw new BadRequestException(USER_ALREADY_REGISTERED_WITH_EMAIL);
    }

    const changeEmailToken = randomBytes(32).toString('hex');
    const changeEmailExpires = addHours(new Date(), 24);
    const userByChangeEmail = await this.userModel.findOneAndUpdate(
      { _id: user._id },
      {
        changeEmailToken,
        changeEmailNew: newEmail,
        changeEmailExpires,
      },
      { new: true },
    );
    if (!userByChangeEmail) {
      Logger.error(USER_NOT_FOUND, 'ChangeEmail - userByChangeEmail');
      throw new NotFoundException(USER_NOT_FOUND);
    }

    // const fullName = `${userByChangeEmail.firstName} ${userByChangeEmail.secondName}`;

    // await changeEmail(
    //   this.configService,
    //   changeEmailToken,
    //   currentEmail,
    //   newEmail,
    //   fullName,
    // );
  }

  async confirmNewEmail(changeEmailToken: string): Promise<void> {
    const userByChangeEmail = await this.userModel.findOne({
      changeEmailToken,
      changeEmailExpires: { $gt: new Date() },
    });
    if (!userByChangeEmail) {
      throw new BadRequestException(CONFIRM_CHANGE_TOKEN_INVALID);
    }

    const newEmail = userByChangeEmail.changeEmailNew;
    // const oldEmail = userByChangeEmail.email;
    // const fullName = `${userByChangeEmail.firstName} ${userByChangeEmail.secondName}`;

    if (!newEmail) {
      throw new NotFoundException(CHANGE_EMAIL_TOKEN_NOT_FOUND);
    }

    await this.userModel.findOneAndUpdate(
      { _id: userByChangeEmail._id },
      {
        email: newEmail,

        changeEmailToken: undefined,
        changeEmailExpires: undefined,
        changeEmailNew: undefined,
      },
      { new: true },
    );

    // await confirmNewEmail(
    //   this.configService,
    //   oldEmail,
    //   newEmail,
    //   fullName,
    // );
  }

  async changePassword(user: IUser, newPassword: string): Promise<void> {
    const {
      passwordHash,
      _id,
      //  email, firstName, secondName
    } = user;
    // const fullName = `${firstName} ${secondName}`;

    const salt = genSaltSync(10);
    const newPasswordHash = hashSync(newPassword, salt);

    if (passwordHash === newPasswordHash) {
      throw new BadRequestException(IDENTICAL_PASSWORD);
    }

    const changePasswordToken = randomBytes(32).toString('hex');
    const changePasswordExpires = addHours(new Date(), 24);
    const userByChangePassword = await this.userModel.findByIdAndUpdate(
      _id,
      {
        changePasswordToken,
        changePasswordNew: newPasswordHash,
        changePasswordExpires,
      },
      { new: true },
    );
    if (!userByChangePassword) {
      throw new NotFoundException(USER_NOT_FOUND);
    }

    // await changePassword(
    //   this.configService,
    //   email,
    //   fullName,
    //   changePasswordToken,
    // );
  }

  async confirmNewPassword(changePasswordToken: string): Promise<void> {
    const userByChangePassword = await this.userModel
      .findOne({
        changePasswordToken,
        changePasswordExpires: { $gt: new Date() },
      })
      .select('+changePasswordNew');
    if (!userByChangePassword) {
      throw new BadRequestException(CONFIRM_CHANGE_TOKEN_INVALID);
    }

    // const fullName = `${userByChangePassword.firstName} ${userByChangePassword.secondName}`;

    await this.userModel.findOneAndUpdate(
      { _id: userByChangePassword.id },
      {
        passwordHash: userByChangePassword.changePasswordNew,

        changePasswordExpires: undefined,
        changePasswordNew: undefined,
        changePasswordToken: undefined,

        passwordChangedAt: new Date(),
      },
      { new: true },
    );

    // await confirmNewPassword(
    //   this.configService,
    //   userByChangePassword.email,
    //   fullName,
    // );
  }
}

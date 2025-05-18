import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  IUser,
  USER_ALREADY_REGISTERED_WITH_LOGIN,
  USER_NOT_FOUND,
} from '@shared';
import { NewUserInfoCredentialsDto } from '../dto';

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private readonly userModel: Model<IUser>) {}

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
}

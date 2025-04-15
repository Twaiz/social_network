import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { genSaltSync, hashSync } from 'bcryptjs';

import { AuthDto } from './dto/auth.dto';
import { IUser } from '@interfaces';

@Injectable()
export class AuthService {
  constructor(@InjectModel('User') private readonly userModel: Model<IUser>) {}

  async createUser(dto: AuthDto): Promise<IUser> {
    const { email, login, password, firstName, secondName } = dto;

    const salt = genSaltSync(10);
    const passwordHash = hashSync(password, salt);

    const newUser = new this.userModel({
      email,
      login,
      passwordHash,
      firstName,
      secondName,
    });

    return newUser.save();
  }

  async findUserByEmail(email: string): Promise<IUser | null> {
    return this.userModel.findOne({ email });
  }

  async findUserByLogin(login: string): Promise<IUser | null> {
    return this.userModel.findOne({ login });
  }

  getMessage(): { message: string } {
    return {
      message: 'Hello API',
    };
  }
}

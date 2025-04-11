import { Injectable } from '@nestjs/common';
import { genSaltSync, hashSync } from 'bcryptjs';
// biome-ignore lint/style/useImportType: <explanation>
import { Model } from 'mongoose';
// biome-ignore lint/style/useImportType: <explanation>
import { IUser } from '@interfaces';
// biome-ignore lint/style/useImportType: <explanation>x
import { AuthDto } from './dto/auth.dto';
import { InjectModel } from '@nestjs/mongoose';

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

  getMessage(): { message: string } {
    return {
      message: 'Hello API',
    };
  }
}

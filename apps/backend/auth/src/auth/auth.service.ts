import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { genSaltSync, hashSync } from 'bcryptjs';

import { UserCredentialsDto } from './dto/user-credentials.dto';
import { IUser } from '@interfaces';
import { EnvString } from '@types';
import { JWT_EXPIRES_IN_ERROR, JWT_SECRET_ERROR } from '@backend-configs';

interface IJwtPayload {
  _id: string;
  email: string;
  login: string;
  role: string;
}

interface IJwtTokenCredentials {
  user: IUser;
  secret: EnvString;
  expiresIn: EnvString;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<IUser>,
    private readonly jwtService: JwtService,
  ) {}

  //* Create User (Register) *//
  async createUser(userCredentialsDto: UserCredentialsDto): Promise<IUser> {
    const { email, login, password, firstName, secondName } =
      userCredentialsDto;

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

  //* Get Jwt Token *//
  async gwtJwtToken(
    jwtCredentials: IJwtTokenCredentials,
  ): Promise<{ token: string }> {
    const { user, secret, expiresIn } = jwtCredentials;

    if (!secret || !expiresIn) {
      Logger.error(
        !secret ? JWT_SECRET_ERROR : JWT_EXPIRES_IN_ERROR,
        'JwtService',
      );
      process.exit(1);
    }

    const payload: IJwtPayload = {
      _id: user._id,
      email: user.email,
      login: user.login,
      role: user.role,
    };

    const token = await this.jwtService.signAsync(payload, {
      secret,
      expiresIn,
    });

    return { token };
  }

  //* Find User By Email *//
  async findUserByEmail(email: string): Promise<IUser | null> {
    return this.userModel.findOne({ email });
  }

  //* Find User By Login *//
  async findUserByLogin(login: string): Promise<IUser | null> {
    return this.userModel.findOne({ login });
  }

  //* Get Message (For e2e Test) *//
  getMessage(): { message: string } {
    return {
      message: 'Hello API',
    };
  }
}

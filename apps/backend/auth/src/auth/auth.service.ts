import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { genSaltSync, hashSync } from 'bcryptjs';

import { UserCredentialsDto } from './dto/user-credentials.dto';
import { IUser } from '@interfaces';
import { EnvString } from '@types';
import { JWT_EXPIRES_IN_ERROR, JWT_SECRET_ERROR } from '@backend-configs';
import { ConfigService } from '@nestjs/config';

interface IJwtPayload {
  _id: string;
  email: string;
  login: string;
  role: string;
}

interface IJwtTokenCredentials {
  user: IUser;
  secret: EnvString;
  jwtExpires: EnvString;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<IUser>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  //* Create User (Register) *//
  async createUser(userCredentialsDto: UserCredentialsDto): Promise<{
    user: IUser;
    token: string;
  }> {
    const { email, login, password, firstName, secondName } =
      userCredentialsDto;

    const secret: EnvString = this.configService.get('JWT_SECRET');
    const jwtExpires: EnvString = this.configService.get('JWT_EXPIRES_IN');

    const salt = genSaltSync(10);
    const passwordHash = hashSync(password, salt);

    const newUser = new this.userModel({
      email,
      login,
      passwordHash,
      firstName,
      secondName,
    });

    const savedUser = await newUser.save();

    const token = await this.getJwtToken({
      user: savedUser,
      secret: secret,
      jwtExpires,
    });

    return {
      user: savedUser,
      token,
    };
  }

  //* Get Jwt Token *//
  async getJwtToken(jwtCredentials: IJwtTokenCredentials): Promise<string> {
    const { user, secret, jwtExpires } = jwtCredentials;

    if (!secret || !jwtExpires) {
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
      expiresIn: jwtExpires,
    });

    return token;
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

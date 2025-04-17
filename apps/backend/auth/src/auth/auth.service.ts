import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { genSaltSync, hashSync } from 'bcryptjs';

import { UserCredentialsDto } from './dto/user-credentials.dto';
import { IUser } from '@interfaces';
import { GetEnv } from '@get-env';

interface IJwtPayload {
  _id: string;
  email: string;
  login: string;
  role: string;
}

interface JwtCreationParams {
  user: IUser;
  jwtSecret: string;
  jwtExpiresIn: string;
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

    const jwtSecret = GetEnv.getJwtSecret(this.configService);
    const jwtExpiresIn = GetEnv.getJwtExpiresIn(this.configService);

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
      jwtSecret: jwtSecret,
      jwtExpiresIn,
    });

    return {
      user: savedUser,
      token,
    };
  }

  //* Get Jwt Token *//
  async getJwtToken(jwtCreationParams: JwtCreationParams): Promise<string> {
    const { user, jwtSecret, jwtExpiresIn } = jwtCreationParams;

    const payload: IJwtPayload = {
      _id: user._id,
      email: user.email,
      login: user.login,
      role: user.role,
    };

    const token = await this.jwtService.signAsync(payload, {
      secret: jwtSecret,
      expiresIn: jwtExpiresIn,
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

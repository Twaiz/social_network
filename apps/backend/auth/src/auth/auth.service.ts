import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';

import { UserRegisterCredentialsDto } from './dto/user-register-credentials.dto';
import { IUser } from '@interfaces';
import { GetEnv } from '@get-env';
import { UserLoginCredentialsDto } from './dto/user-login-credentials.dto';
import { USER_INVALID_PASSWORD, USER_NOT_FOUND } from './auth.constants';

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
  async createUser(
    userRegisterCredentialsDto: UserRegisterCredentialsDto,
  ): Promise<{
    user: IUser;
    token: string;
  }> {
    const { email, login, password, firstName, secondName } =
      userRegisterCredentialsDto;

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

  //* Login *//
  async login(
    userLoginCredentialsDto: UserLoginCredentialsDto,
  ): Promise<string> {
    const { email, login, password } = userLoginCredentialsDto;

    const jwtSecret = GetEnv.getJwtSecret(this.configService);
    const jwtExpiresIn = GetEnv.getJwtExpiresIn(this.configService);

    let user: IUser | null = null;

    if (email) {
      user = await this.findUserByEmail(email);
    } else if (login) {
      user = await this.findUserByLogin(login);
    }

    if (!user) {
      throw new BadRequestException(USER_NOT_FOUND);
    }

    const isPasswordValid = compareSync(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new BadRequestException(USER_INVALID_PASSWORD);
    }

    console.log(email, login);

    const token = await this.getJwtToken({
      user,
      jwtSecret,
      jwtExpiresIn,
    });

    return token;
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

import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';

import { NOT_FOUND_2FA_CODE, USER_INVALID_PASSWORD } from './auth.constants';
import { TwoFaService } from '../two-fa/two-fa.service';

import { LoginDto, UserRegisterCredentialsDto } from '@dtos';
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
    @Inject(forwardRef(() => TwoFaService))
    private readonly twoFaService: TwoFaService,
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

    const user = await newUser.save();

    const token = await this.getJwtToken({
      user,
      jwtSecret,
      jwtExpiresIn,
    });

    return {
      user,
      token,
    };
  }

  //* Login *//
  async login(loginDto: LoginDto): Promise<string> {
    const { user, password, twoFactorCode } = loginDto;

    const jwtSecret = GetEnv.getJwtSecret(this.configService);
    const jwtExpiresIn = GetEnv.getJwtExpiresIn(this.configService);

    const isPasswordValid = compareSync(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new BadRequestException(USER_INVALID_PASSWORD);
    }

    if (user.isTwoFactorEnabled) {
      if (!twoFactorCode) {
        throw new BadRequestException(NOT_FOUND_2FA_CODE);
      }

      await this.twoFaService.verifyTwoFactorCode(user, twoFactorCode);
    }

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
  //TODO - убрать нахер эти 2 метода поиска user-а. Они никаким боком не торкаются модуля Auth. Они должны быть в User
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

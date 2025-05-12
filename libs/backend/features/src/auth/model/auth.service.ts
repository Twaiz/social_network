import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'node:crypto';
import { Model } from 'mongoose';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';
import { addHours } from 'date-fns';

import {
  CONFIRM_EMAIL_TOKEN_INVALID,
  NOT_FOUND_2FA_CODE,
} from './constant/auth-service.constants';
import { USER_INVALID_PASSWORD } from '../auth.constants';

import { LoginServiceDto, RegisterCredentialsDto } from '../dto';
import { sendEmailConfirmation } from './lib/sendEmailConfirmation';

import {
  IUser,
  RegisterResponse,
  USER_NOT_FOUND,
  GetEnv,
  verifyTwoFactorCode,
} from '@shared';

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
    registerCredentialsDto: RegisterCredentialsDto,
  ): Promise<RegisterResponse> {
    const { email, login, password, firstName, secondName } =
      registerCredentialsDto;

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
  async login(LoginServiceDto: LoginServiceDto): Promise<string> {
    const { user, password, twoFactorCode } = LoginServiceDto;

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

      verifyTwoFactorCode(user, twoFactorCode);
    }

    const token = await this.getJwtToken({
      user,
      jwtSecret,
      jwtExpiresIn,
    });

    return token;
  }

  //* Email Confirmation *//
  async confirmEmail(token: string): Promise<void> {
    const userByConfirmEmail = await this.userModel
      .findOneAndUpdate(
        {
          emailConfirmToken: token,
          emailExpiresToken: { $gt: new Date() },
        },
        {
          isEmailConfirm: true,
          emailConfirmToken: null,
          emailExpiresToken: null,
        },
      )
      .select('+emailConfirmToken');

    if (!userByConfirmEmail) {
      throw new BadRequestException(CONFIRM_EMAIL_TOKEN_INVALID);
    }
  }

  //* Generate Email Token *//
  async generateEmailToken(user: IUser): Promise<void> {
    const emailConfirmToken = randomBytes(32).toString('hex');
    const emailExpiresToken = addHours(new Date(), 24);

    const userByConfirmEmail = await this.userModel.findByIdAndUpdate(
      user._id,
      {
        emailConfirmToken,
        emailExpiresToken,
      },
    );
    if (!userByConfirmEmail) {
      throw new NotFoundException(USER_NOT_FOUND);
    }

    sendEmailConfirmation(this.configService, emailConfirmToken, user.email);
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
}

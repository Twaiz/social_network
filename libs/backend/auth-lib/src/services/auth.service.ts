import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
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
  USER_INVALID_PASSWORD,
} from '../auth.constants';
import { LoginDto, UserRegisterCredentialsDto } from '../dtos';
import { sendEmailConfirmation } from '../utils';

import { TwoFaService } from '@two-fa-lib';
import { IUser, USER_NOT_FOUND } from '@shared';
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
          emailConfirmToken: undefined,
          emailExpiresToken: undefined,
        },
      )
      .select('+emailConfirmToken');

    Logger.log('userByConfirmEmail', userByConfirmEmail);

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

  //* Get Message (For e2e Test) *//
  getMessage(): { message: string } {
    return {
      message: 'Hello API',
    };
  }
}

import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'node:crypto';
import { Model } from 'mongoose';
import { genSaltSync, hashSync } from 'bcryptjs';
import { addHours } from 'date-fns';

import {
  IUser,
  RegisterResponse,
  USER_NOT_FOUND,
  GetEnv,
  verifyTwoFactorCode,
  getJwtToken,
  verifyPassword,
  PASSWORDHASH_IS_NOT_FOUND,
  USER_ALREADY_REGISTERED_WITH_EMAIL,
  USER_ALREADY_REGISTERED_WITH_LOGIN,
  USER_PASSWORD_INVALID,
} from '@shared';

import {
  CONFIRM_EMAIL_TOKEN_INVALID,
  NOT_FOUND_2FA_CODE,
  USER_ALREADY_REGISTERED_WITH_EMAIL_AND_LOGIN,
} from './constant';
import { LoginCredentialsDto, RegisterCredentialsDto } from '../dto';
// import { confirmEmail } from './lib';

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

    const userByEmail = await this.userModel.findOne({ email });
    const userByLogin = await this.userModel.findOne({ login });

    const emailExists = !!userByEmail;
    const loginExists = !!userByLogin;

    if (emailExists && loginExists) {
      throw new BadRequestException(
        USER_ALREADY_REGISTERED_WITH_EMAIL_AND_LOGIN,
      );
    }

    if (emailExists || loginExists) {
      throw new BadRequestException(
        emailExists
          ? USER_ALREADY_REGISTERED_WITH_EMAIL
          : USER_ALREADY_REGISTERED_WITH_LOGIN,
      );
    }

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

    const token = await getJwtToken(this.jwtService, {
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
  async login(loginCredentialsDto: LoginCredentialsDto): Promise<string> {
    const { email, login, password, twoFactorCode } = loginCredentialsDto;
    const selectPasswordHash = '+passwordHash';

    let user: IUser | null = null;

    const jwtSecret = GetEnv.getJwtSecret(this.configService);
    const jwtExpiresIn = GetEnv.getJwtExpiresIn(this.configService);

    const emailOrLogin = email ? 'email' : 'login';
    const INVALID_LOGIN_CREDENTIALS = `${USER_PASSWORD_INVALID} или ${emailOrLogin}. Попробуйте ещё раз.`;

    if (email) {
      user = await this.userModel.findOne({ email }).select(selectPasswordHash);
    } else if (login) {
      user = await this.userModel.findOne({ login }).select(selectPasswordHash);
    }

    if (!user) {
      throw new NotFoundException(INVALID_LOGIN_CREDENTIALS);
    }
    if (!user.passwordHash) {
      Logger.error(PASSWORDHASH_IS_NOT_FOUND);
      throw new BadRequestException(PASSWORDHASH_IS_NOT_FOUND);
    }

    verifyPassword(user.passwordHash, password, INVALID_LOGIN_CREDENTIALS);

    if (user.isTwoFactorEnabled) {
      if (!twoFactorCode) {
        throw new BadRequestException(NOT_FOUND_2FA_CODE);
      }

      verifyTwoFactorCode(user, twoFactorCode);
    }

    const token = await getJwtToken(this.jwtService, {
      user,
      jwtSecret,
      jwtExpiresIn,
    });

    return token;
  }

  //* Email Confirmation *//
  async confirmEmail(token: string): Promise<void> {
    const userByConfirmEmail = await this.userModel
      .findOne({
        emailConfirmToken: token,
        emailExpiresToken: { $gt: new Date() },
      })
      .select('+emailConfirmToken');

    if (!userByConfirmEmail) {
      throw new BadRequestException(CONFIRM_EMAIL_TOKEN_INVALID);
    }

    userByConfirmEmail.isEmailConfirm = true;
    userByConfirmEmail.emailConfirmToken = undefined;
    userByConfirmEmail.emailExpiresToken = undefined;

    await userByConfirmEmail.save();
  }

  //* Generate Email Token *//
  async generateEmailToken(user: IUser): Promise<void> {
    // const { email, firstName, secondName } = user;
    // const fullName = `${firstName} ${secondName}`;

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

    //TODO - переназвать на generateEmailToken
    // confirmEmail(this.configService, email, emailConfirmToken, fullName);
  }
}

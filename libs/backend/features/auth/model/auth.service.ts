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
  CONFIRM_EMAIL_TOKEN_INVALID,
  NOT_FOUND_2FA_CODE,
  USER_ALREADY_REGISTERED_WITH_EMAIL_AND_LOGIN,
} from './constant';
import { LoginServiceDto, RegisterCredentialsDto } from '../dto';
// import { sendEmailConfirmation } from './lib';

import {
  IUser,
  RegisterResponse,
  USER_NOT_FOUND,
  GetEnv,
  verifyTwoFactorCode,
  getJwtToken,
  verifyPassword,
  PASSWORDHASH_IS_NOT_FOUND,
  findUser,
  EFieldByFindUser,
  USER_ALREADY_REGISTERED_WITH_EMAIL,
  USER_ALREADY_REGISTERED_WITH_LOGIN,
} from '@shared';

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

    const userByEmail = await findUser(
      this.userModel,
      EFieldByFindUser.EMAIL,
      email,
      USER_NOT_FOUND,
      'Register - findByEmail',
    );
    const userByLogin = await findUser(
      this.userModel,
      EFieldByFindUser.LOGIN,
      login,
      USER_NOT_FOUND,
      'Register - findByLogin',
    );

    const emailExists = !!userByEmail;
    const loginExists = !!userByLogin;

    if (emailExists && loginExists) {
      throw new BadRequestException(
        USER_ALREADY_REGISTERED_WITH_EMAIL_AND_LOGIN,
      );
    }

    //TODO - константы которые ниже, они у нас лежат в global.constants, но используются только тут. надо пересмотреть и если что перенести их в auth-service.constants
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
  //TODO - service не должен принимать dto, он должен принимать аргументы
  async login(LoginServiceDto: LoginServiceDto): Promise<string> {
    const { user, password, twoFactorCode, errorMessage } = LoginServiceDto;
    if (!user.passwordHash) {
      Logger.error(PASSWORDHASH_IS_NOT_FOUND);
      throw new BadRequestException(PASSWORDHASH_IS_NOT_FOUND);
    }

    const jwtSecret = GetEnv.getJwtSecret(this.configService);
    const jwtExpiresIn = GetEnv.getJwtExpiresIn(this.configService);

    verifyPassword(user.passwordHash, password, errorMessage);

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

    if (!userByConfirmEmail) {
      throw new BadRequestException(CONFIRM_EMAIL_TOKEN_INVALID);
    }

    //TODO - добавить сообщения на почту об успешном подтверждение и прочем, как в changeEmail
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

    //TODO - переделать метод sendEmailConfirmation. сделать как в других кастомных методах отправки писем
    // sendEmailConfirmation(this.configService, emailConfirmToken, user.email);
  }

  //TODO - почему ещё нету метода forgetPassword. Мы уже делаем часть userCredentials, но ещё нормально не закончили auth часть. Решить этот вопрос.
}

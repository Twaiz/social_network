//? Внешние зависимости ?\\
import { ConfigService } from '@nestjs/config';
import { INestApplication, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import request from 'supertest';
import { App } from 'supertest/types';
//? ---Внешние зависимости--- ?\\

//? Внутренние зависимости ?\\
import {
  APP_INIT_FAILED,
  bootstrap,
  ChangeEmailCredentialsDto,
  ChangePasswordCredentialsDto,
  ConfirmChangedEmailCredentialsDto,
  ConfirmNewPasswordCredentialsDto,
  EFieldByFindUser,
  findUser,
  getActiveToken,
  GetEnv,
  IUser,
  NewUserInfoCredentialsDto,
  USER_NOT_FOUND,
  VerifyPasswordCredentialsDto,
  VerifyPasswordResponse,
} from '@shared';
import { UserModule } from '@features/user';

import {
  CHANGE_EMAIL_EXPIRES_NOT_FOUND,
  CHANGE_PASSWORD_EXPIRES_NOT_FOUND,
} from './constant';

//? ---Внутренние зависимости--- ?\\

//? Тестовые данные ?\\
const NewUserInfoCredentials: NewUserInfoCredentialsDto = {
  firstName: 'Oleg',
  secondName: 'Olegovich',
};

const ChangeEmailCredentials: ChangeEmailCredentialsDto = {
  newEmail: 'newAdmin@gmail.com',
};

const ChangePasswordCredentials: ChangePasswordCredentialsDto = {
  newPassword: 'admin123',
};

const VerifyPasswordCredentials: VerifyPasswordCredentialsDto = {
  password: 'admin321',
};
//? ---Тестовые данные--- ?\\

//? User-E2E тест ?\\
describe('App - User (e2e)', () => {
  //? Объявление переменных ?\\
  let app: INestApplication<App>;
  let token: string;
  let verificationPasswordToken: string;
  let user: IUser;

  let jwtService: JwtService;
  let configService: ConfigService;
  let userModel: Model<IUser>;
  //? ---Объявление переменных--- ?\\

  //? Подготовка перед тестами ?\\
  beforeAll(async () => {
    const userPort = process.env.USER_SERVER_PORT;
    const port = GetEnv.getServerPort(userPort);

    const serverApp = await bootstrap<App>(UserModule, port);
    if (!serverApp) {
      Logger.error(APP_INIT_FAILED, 'User-E2E - beforeAll');
      process.exit(1);
    }

    app = serverApp;

    jwtService = app.get(JwtService);
    configService = app.get(ConfigService);
    userModel = app.get(getModelToken('User'));

    const fullLogin = await getActiveToken(
      jwtService,
      configService,
      userModel,
    );
    const res = await request(app.getHttpServer())
      .post('/api/auth/verify-password')
      .set('Authorization', `Bearer ${fullLogin.token}`)
      .send(VerifyPasswordCredentials)
      .expect(200);
    const data: VerifyPasswordResponse = res.body;

    verificationPasswordToken = data.verificationPasswordToken;
    token = fullLogin.token;
    user = fullLogin.user;
  });
  //? ---Подготовка перед тестами--- ?\\

  //? 1-ый Запрос - Update User Info ?\\
  it('user/updateUserInfo -- success', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/user/updateUserInfo')
      .set('Authorization', `Bearer ${token}`)
      .set('x-verification-password-token', verificationPasswordToken)
      .send(NewUserInfoCredentials)
      .expect(200);

    const data: IUser = res.body;

    if (NewUserInfoCredentials.login) {
      expect(data.login).toEqual(NewUserInfoCredentials.login ?? data.login);
    }
    if (NewUserInfoCredentials.firstName) {
      expect(data.firstName).toEqual(
        NewUserInfoCredentials.firstName ?? data.firstName,
      );
    }
    if (NewUserInfoCredentials.secondName) {
      expect(data.secondName).toEqual(
        NewUserInfoCredentials.secondName ?? data.secondName,
      );
    }
  });
  //? ---1-ый Запрос - Update User Info--- ?\\

  //? 2-ый Запрос - Change Email ?\\
  it('user/change-email', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/user/change-email')
      .set('Authorization', `Bearer ${token}`)
      .set('x-verification-password-token', verificationPasswordToken)
      .send(ChangeEmailCredentials)
      .expect(201);

    const data = res.body;

    expect(data).toHaveProperty('message');

    const userAfter = await findUser(
      userModel,
      EFieldByFindUser.ID,
      user._id,
      USER_NOT_FOUND,
      'E2E ChangeEmail - findById',
      '+changeEmailToken',
    );
    if (!userAfter.changeEmailExpires) {
      Logger.error(
        CHANGE_EMAIL_EXPIRES_NOT_FOUND,
        'E2E ChangeEmail - changeEmailExpires',
      );
      process.exit(1);
    }

    expect(userAfter.changeEmailToken).toBe(userAfter.changeEmailToken);
    expect(userAfter.changeEmailNew).toBe(ChangeEmailCredentials.newEmail);

    const now = new Date();
    const expiresDate = new Date(userAfter.changeEmailExpires);

    expect(expiresDate.getTime()).toBeGreaterThan(now.getTime());
  });
  //? ---2-ой Запрос - Change Email--- ?\\

  //? 3-ий Запрос - Confirm New Email ?\\
  it('user/confirm-new-email -- success', async () => {
    const userBefore = await findUser(
      userModel,
      EFieldByFindUser.ID,
      user._id,
      USER_NOT_FOUND,
      'E2E ConfirmNewEmail - findByEmail',
      '+changeEmailToken',
    );

    const res = await request(app.getHttpServer())
      .post('/api/user/confirm-new-email')
      .send({
        changeEmailToken: userBefore.changeEmailToken,
      } as ConfirmChangedEmailCredentialsDto)
      .expect(200);

    expect(res.body).toHaveProperty('message');

    const userAfter = await findUser(
      userModel,
      EFieldByFindUser.ID,
      user._id,
      USER_NOT_FOUND,
      'E2E ConfirmNewEmail - findById',
      '+changeEmailToken',
    );

    expect(userAfter.email).toBe(userBefore.changeEmailNew);

    expect(userAfter.changeEmailToken).toBeUndefined();
    expect(userAfter.changeEmailNew).toBeUndefined();
    expect(userAfter.changeEmailExpires).toBeUndefined();
  });
  //? ---3-ий Запрос - Confirm New Email--- ?\\

  //? 4-ый Запрос - Change Password ?\\
  it('user/change-password -- success', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/user/change-password')
      .set('Authorization', `Bearer ${token}`)
      .set('x-verification-password-token', verificationPasswordToken)
      .send(ChangePasswordCredentials)
      .expect(201);

    expect(res.body).toHaveProperty('message');

    const userAfter = await findUser(
      userModel,
      EFieldByFindUser.ID,
      user._id,
      USER_NOT_FOUND,
      'E2E ChangePassword - findById',
      '+changePasswordToken +changePasswordNew',
    );

    if (!userAfter.changePasswordExpires) {
      Logger.error(
        CHANGE_PASSWORD_EXPIRES_NOT_FOUND,
        'E2E ChangePassword - changePasswordExpires',
      );
      process.exit(1);
    }

    expect(userAfter.changePasswordNew).toBe(userAfter.changePasswordNew);
    expect(userAfter.changePasswordToken).toBe(userAfter.changePasswordToken);

    const now = new Date();
    const expiresDate = new Date(userAfter.changePasswordExpires);

    expect(expiresDate.getTime()).toBeGreaterThan(now.getTime());
  });
  //? ---4-ый Запрос - Change Password--- ?\\

  //? 5-ый Запрос - Confirm New Password ?\\
  it('user/confirm-new-password -- success', async () => {
    const userBefore = await findUser(
      userModel,
      EFieldByFindUser.ID,
      user._id,
      USER_NOT_FOUND,
      'E2E ConfirmNewPassword - findById',
      '+changePasswordToken +changePasswordNew',
    );

    const res = await request(app.getHttpServer())
      .post('/api/user/confirm-new-password')
      .send({
        changePasswordToken: userBefore.changePasswordToken,
      } as ConfirmNewPasswordCredentialsDto)
      .expect(200);

    expect(res.body).toHaveProperty('message');

    const userAfter = await findUser(
      userModel,
      EFieldByFindUser.ID,
      user._id,
      USER_NOT_FOUND,
      'E2E ConfirmNewPassword - findById',
      '+passwordHash +changePasswordToken +changePasswordNew',
    );

    expect(userAfter.passwordHash).toBe(userBefore.changePasswordNew);

    expect(userAfter.changePasswordExpires).toBeUndefined();
    expect(userAfter.changePasswordToken).toBeUndefined();
    expect(userAfter.changePasswordNew).toBeUndefined();
  });
  //? ---5-ый Запрос - Confirm New Password--- ?\\

  //? Сброс после тестов ?\\
  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });
  //? ---Сброс после тестов--- ?\\
});

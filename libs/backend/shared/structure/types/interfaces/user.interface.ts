import { EUserRole } from '../enums';

export interface IUser {
  _id: string;

  email: string;
  login: string;
  passwordHash?: string;

  role: EUserRole;

  firstName: string;
  secondName: string;

  isProfileComplete: boolean;
  isTwoFactorEnabled: boolean;
  isEmailConfirm: boolean;

  twoFactorSecret?: string;

  emailConfirmToken?: string;
  emailExpiresToken?: Date;

  changeEmailToken?: string;
  changeEmailNew?: string;
  changeEmailExpires?: Date;

  changePasswordToken?: string;
  changePasswordNew?: string;
  changePasswordExpires?: Date;

  passwordChangedAt?: Date;
}

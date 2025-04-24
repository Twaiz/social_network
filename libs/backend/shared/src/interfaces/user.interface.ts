import { EUserRole } from '../../enums/user.role';

export interface IUser {
  _id: string;
  email: string;
  login: string;
  passwordHash: string;
  role: EUserRole;
  firstName: string;
  secondName: string;
  isProfileComplete: boolean;
  isTwoFactorEnabled: boolean;
  twoFactorSecret: string;
}

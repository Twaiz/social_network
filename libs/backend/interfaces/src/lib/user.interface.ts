import { EUserRole } from '@roles';

export interface IUser {
  email: string;
  login: string;
  passwordHash: string;
  role: EUserRole;
  firstName: string;
  secondName: string;
  isProfileComplete: boolean;
}

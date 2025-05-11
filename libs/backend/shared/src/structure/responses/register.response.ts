import { IUser } from '../interfaces/user.interface';

export interface RegisterResponse {
  user: IUser;
  token: string;
}

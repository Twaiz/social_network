import { IUser } from '../interfaces';

export interface RegisterResponse {
  user: IUser;
  token: string;
}

import { Request } from 'express';

import { IUser } from './user.interface';

export interface AuthenticatedRequest extends Request {
  user: IUser;
}

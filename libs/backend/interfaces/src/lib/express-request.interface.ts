import { Request } from 'express';

import { IUser } from './user.interface';

export interface IExpressRequest extends Request {
  user?: IUser;
}

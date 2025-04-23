// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as express from 'express';

import { IUser } from '../../../../libs/backend/interfaces/src';

declare global {
  namespace Express {
    export interface Request {
      user?: IUser;
    }
  }
}

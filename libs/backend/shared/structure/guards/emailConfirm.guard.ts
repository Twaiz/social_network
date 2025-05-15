import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';

import { AuthenticatedRequest } from '../types';
import { USER_NOT_FOUND } from '../../config';
import { EMAIL_NOT_CONFIRMED_ERROR } from './constant/emailConfirm.constants';

@Injectable()
export class EmailConfirmGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request: AuthenticatedRequest = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      Logger.error(USER_NOT_FOUND, 'EmailConfirmGuard');
      throw new BadRequestException(USER_NOT_FOUND);
    }

    if (!user.isEmailConfirm) {
      throw new BadRequestException(EMAIL_NOT_CONFIRMED_ERROR);
    }

    return true;
  }
}

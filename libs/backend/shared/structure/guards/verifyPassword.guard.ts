import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  NONE_VERIFICATION_PASSWORD,
  PAYLOAD_TYPE_VERIFICATION_PASSWORD_TOKEN_INVALID,
  VERIFICATION_PASSWORD_INVALID,
} from './constant';

@Injectable()
export class VerifyPasswordGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const loggerContext = 'VerifyPasswordGuard';

    const req = context.switchToHttp().getRequest();
    const verifyPasswordToken = req.headers['x-verification-password-token'];

    if (!verifyPasswordToken) {
      Logger.error(NONE_VERIFICATION_PASSWORD, loggerContext);
      throw new UnauthorizedException(NONE_VERIFICATION_PASSWORD);
    }

    try {
      const payload = this.jwtService.verify(verifyPasswordToken);
      if (payload.type !== 'verificationPassword') {
        Logger.error(
          PAYLOAD_TYPE_VERIFICATION_PASSWORD_TOKEN_INVALID,
          loggerContext,
        );
        throw new UnauthorizedException(
          PAYLOAD_TYPE_VERIFICATION_PASSWORD_TOKEN_INVALID,
        );
      }

      req.verifiedUserId = payload.sub;

      return true;
    } catch (error) {
      if (error instanceof Error) Logger.error(error.message, loggerContext);

      Logger.error(VERIFICATION_PASSWORD_INVALID, loggerContext);
      throw new UnauthorizedException(VERIFICATION_PASSWORD_INVALID);
    }
  }
}

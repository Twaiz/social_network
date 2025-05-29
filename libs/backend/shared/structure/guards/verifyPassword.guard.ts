import {
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  NONE_VERIFICATION_PASSWORD,
  PAYLOAD_TYPE_VERIFICATION_PASSWORD_TOKEN_INVALID,
  VERIFICATION_PASSWORD_INVALID,
} from './constant/verifyPassword.constants';

export class VerifyPasswordGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const verifyPasswordToken = req.headers['x-verification-password-token'];

    if (!verifyPasswordToken) {
      throw new UnauthorizedException(NONE_VERIFICATION_PASSWORD);
    }

    try {
      const payload = this.jwtService.verify(verifyPasswordToken);
      if (payload.type !== 'verification') {
        throw new UnauthorizedException(
          PAYLOAD_TYPE_VERIFICATION_PASSWORD_TOKEN_INVALID,
        );
      }

      req.verifiedUserId = payload.sub;

      return payload;
    } catch (_error) {
      throw new UnauthorizedException(VERIFICATION_PASSWORD_INVALID);
    }
  }
}

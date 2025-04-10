import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
// biome-ignore lint/style/useImportType: <explanation>
import { ConfigService } from '@nestjs/config';
// biome-ignore lint/style/useImportType: <explanation>
import { IUser } from '@interfaces';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const secretKey: string | undefined = configService.get('JWT_SECRET');
    if (!secretKey) {
      throw new Error('Не найдено секретного кода JWT');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secretKey,
      ignoreExpiration: false,
    });
  }

  async validate(payload: IUser): Promise<IUser> {
    return payload;
  }
}

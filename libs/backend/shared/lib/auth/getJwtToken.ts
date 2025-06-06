import { JwtService } from '@nestjs/jwt';

import { IUser } from '../../structure';

interface IJwtPayload {
  _id: string;
  email: string;
  login: string;
  role: string;
}

interface JwtCreationParams {
  user: IUser;
  jwtSecret: string;
  jwtExpiresIn: string;
}

export const getJwtToken = async (
  jwtService: JwtService,
  jwtCreationParams: JwtCreationParams,
): Promise<string> => {
  const { user, jwtSecret, jwtExpiresIn } = jwtCreationParams;

  const payload: IJwtPayload = {
    _id: user._id,
    email: user.email,
    login: user.login,
    role: user.role,
  };

  const token = await jwtService.signAsync(payload, {
    secret: jwtSecret,
    expiresIn: jwtExpiresIn,
  });

  return token;
};

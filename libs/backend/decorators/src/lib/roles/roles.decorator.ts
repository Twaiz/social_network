import { CustomDecorator, SetMetadata } from '@nestjs/common';

import { ROLES_KEY } from './roles.constants';

export const Roles = (...roles: string[]): CustomDecorator<string> =>
  SetMetadata(ROLES_KEY, roles);

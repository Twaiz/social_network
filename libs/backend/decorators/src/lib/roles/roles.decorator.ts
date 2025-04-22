import { CustomDecorator, SetMetadata } from '@nestjs/common';

import { ROLES_KEY } from './roles.constants';
import { EUserRole } from '@enums';

export const Roles = (...roles: EUserRole[]): CustomDecorator<string> =>
  SetMetadata(ROLES_KEY, roles);

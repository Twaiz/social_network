import { CustomDecorator, SetMetadata } from '@nestjs/common';

import { ROLES_KEY } from '../decorators';
import { EUserRole } from '../enums';

export const Roles = (...roles: EUserRole[]): CustomDecorator<string> =>
  SetMetadata(ROLES_KEY, roles);

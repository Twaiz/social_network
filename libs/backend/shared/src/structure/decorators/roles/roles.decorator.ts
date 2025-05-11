import { CustomDecorator, SetMetadata } from '@nestjs/common';

import { ROLES_KEY } from './constant/roles-decorator.constants';
import { EUserRole } from '../../enums/user.role';

export const Roles = (...roles: EUserRole[]): CustomDecorator<string> =>
  SetMetadata(ROLES_KEY, roles);

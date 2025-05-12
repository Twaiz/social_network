import { CustomDecorator, SetMetadata } from '@nestjs/common';

import { ROLES_KEY } from './constant';
import { EUserRole } from '../../types';

export const Roles = (...roles: EUserRole[]): CustomDecorator<string> =>
  SetMetadata(ROLES_KEY, roles);

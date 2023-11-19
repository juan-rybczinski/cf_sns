import { RolesEnum } from '../const/roles.const';
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'users_roles';

export const Roles = (role: RolesEnum) => SetMetadata(ROLES_KEY, role);

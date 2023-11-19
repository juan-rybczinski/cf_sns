import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { RolesEnum } from './const/roles.const';
import { Roles } from './decorator/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(RolesEnum.ADMIN)
  @Get()
  getUsers() {
    return this.usersService.getAllUsers();
  }
}

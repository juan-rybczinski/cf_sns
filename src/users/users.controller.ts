import { Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { RolesEnum } from './const/roles.const';
import { Roles } from './decorator/roles.decorator';
import { User } from './decorator/user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(RolesEnum.ADMIN)
  @Get()
  getUsers() {
    return this.usersService.getAllUsers();
  }

  @Post('follow/:id')
  postFollow(
    @User('id') followerId: number,
    @Param('id', ParseIntPipe) followeeId: number,
  ) {
    return this.usersService.followUser(followerId, followeeId);
  }

  @Get('follow/me')
  getFollowers(@User('id') userId: number) {
    return this.usersService.getFollowers(userId);
  }
}

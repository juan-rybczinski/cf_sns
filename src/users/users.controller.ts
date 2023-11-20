import {
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
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
  getFollowers(
    @User('id') userId: number,
    @Query('includeNotConfirmed', new DefaultValuePipe(false), ParseBoolPipe)
    includeNotConfirmed: boolean,
  ) {
    return this.usersService.getFollowers(userId, includeNotConfirmed);
  }

  @Patch('follow/:id/confirm')
  patchFollowConfirm(
    @User('id') followeeId: number,
    @Param('id', ParseIntPipe) followerId: number,
  ) {
    return this.usersService.confirmFollow(followerId, followeeId);
  }

  @Delete('follow/:id')
  deleteFollow(
    @User('id') followerId: number,
    @Param('id', ParseIntPipe) followeeId: number,
  ) {
    return this.usersService.cancelFollow(followerId, followeeId);
  }
}

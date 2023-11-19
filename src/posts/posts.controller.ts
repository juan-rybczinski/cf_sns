import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { AccessTokenGuard } from '../auth/guard/bearer-token.guard';
import { User } from '../users/decorator/user.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatePostDto } from './dto/paginate-post.dto';
import { UsersModel } from '../users/entities/users.entity';
import { LogInterceptor } from '../common/interceptor/log.interceptor';
import { TransactionInterceptor } from '../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { HttpExceptionFilter } from '../common/exception-filter/http.exception-filter';
import { Roles } from '../users/decorator/roles.decorator';
import { RolesEnum } from '../users/const/roles.const';
import { IsPublic } from '../common/decorator/is-public.decorator';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @IsPublic()
  @Get()
  @UseInterceptors(LogInterceptor)
  getPosts(@Query() query: PaginatePostDto) {
    return this.postsService.paginatePosts(query);
  }

  @IsPublic()
  @Get(':id')
  getPost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.getPostById(id);
  }

  @Post()
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(TransactionInterceptor)
  @UseFilters(HttpExceptionFilter)
  postPosts(
    @User('id') userId: number,
    @Body() body: CreatePostDto,
    @QueryRunner() qr: QR,
  ) {
    return this.postsService.createPost(userId, body, qr);
  }

  @Post('random')
  @UseGuards(AccessTokenGuard)
  async postRandomPosts(@User() user: UsersModel) {
    await this.postsService.generatePosts(user.id);
    return true;
  }

  @Patch(':id')
  patchPost(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdatePostDto,
  ) {
    return this.postsService.updatePost(id, body);
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard)
  @Roles(RolesEnum.ADMIN)
  deletePost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.deletePost(id);
  }
}

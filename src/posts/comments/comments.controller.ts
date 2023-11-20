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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { QueryRunner as QR } from 'typeorm';
import { CommentsService } from './comments.service';
import { User } from '../../users/decorator/user.decorator';
import { CreateCommentDto } from './dto/create-comment.dto';
import { BasePaginationDto } from '../../common/dto/base-pagination.dto';
import { IsPublic } from '../../common/decorator/is-public.decorator';
import { IsCommentMineOrAdminGuard } from './guard/is-comment-mine-or-admin.guard';
import { TransactionInterceptor } from '../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../common/decorator/query-runner.decorator';
import { PostsService } from '../posts.service';

@Controller('posts/:pid/comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly postsService: PostsService,
  ) {}

  @Post()
  @UseInterceptors(TransactionInterceptor)
  async postComment(
    @User('id') authorId: number,
    @Param('pid', ParseIntPipe) postId: number,
    @Body() body: CreateCommentDto,
    @QueryRunner() qr: QR,
  ) {
    const resp = await this.commentsService.postComments(
      authorId,
      postId,
      body,
      qr,
    );

    await this.postsService.incrementCommentCount(postId, qr);

    return resp;
  }

  @IsPublic()
  @Get(':commentId')
  getComment(@Param('commentId', ParseIntPipe) id: number) {
    return this.commentsService.getCommentById(id);
  }

  @IsPublic()
  @Get()
  getComments(
    @Param('pid', ParseIntPipe) postId: number,
    @Query() query: BasePaginationDto,
  ) {
    return this.commentsService.paginateComments(postId, query);
  }

  @Patch(':commentId')
  @UseGuards(IsCommentMineOrAdminGuard)
  patchComment(
    @Param('commentId', ParseIntPipe) id: number,
    @Body() body: CreateCommentDto,
  ) {
    return this.commentsService.updateComment(id, body);
  }

  @Delete(':commentId')
  @UseGuards(IsCommentMineOrAdminGuard)
  @UseInterceptors(TransactionInterceptor)
  async deleteComment(
    @Param('commentId', ParseIntPipe) id: number,
    @Param('pid', ParseIntPipe) postId: number,
    @QueryRunner() qr: QR,
  ) {
    const resp = await this.commentsService.deleteComment(id);

    await this.postsService.decrementCommentCount(postId, qr);

    return resp;
  }
}

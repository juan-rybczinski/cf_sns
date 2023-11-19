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
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { User } from '../../users/decorator/user.decorator';
import { CreateCommentDto } from './dto/create-comment.dto';
import { BasePaginationDto } from '../../common/dto/base-pagination.dto';
import { IsPublic } from '../../common/decorator/is-public.decorator';

@Controller('posts/:pid/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  postComment(
    @User('id') authorId: number,
    @Param('pid', ParseIntPipe) postId: number,
    @Body() body: CreateCommentDto,
  ) {
    return this.commentsService.postComments(authorId, postId, body);
  }

  @IsPublic()
  @Get(':cid')
  getComment(@Param('cid', ParseIntPipe) id: number) {
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

  @Patch(':cid')
  patchComment(
    @Param('cid', ParseIntPipe) id: number,
    @Body() body: CreateCommentDto,
  ) {
    return this.commentsService.updateComment(id, body);
  }

  @Delete(':cid')
  deleteComment(@Param('cid', ParseIntPipe) id: number) {
    return this.commentsService.deleteComment(id);
  }
}

import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { AccessTokenGuard } from '../../auth/guard/bearer-token.guard';
import { User } from '../../users/decorator/user.decorator';
import { CreateCommentDto } from './dto/create-comment.dto';
import { BasePaginationDto } from '../../common/dto/base-pagination.dto';

@Controller('posts/:pid/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @UseGuards(AccessTokenGuard)
  postComment(
    @User('id') authorId: number,
    @Param('pid', ParseIntPipe) postId: number,
    @Body() body: CreateCommentDto,
  ) {
    return this.commentsService.postComments(authorId, postId, body);
  }

  @Get(':cid')
  @UseGuards(AccessTokenGuard)
  getComment(@Param('cid', ParseIntPipe) id: number) {
    return this.commentsService.getCommentById(id);
  }

  @Get()
  @UseGuards(AccessTokenGuard)
  getComments(
    @Param('pid', ParseIntPipe) postId: number,
    @Query() query: BasePaginationDto,
  ) {
    return this.commentsService.paginateComments(postId, query);
  }
}

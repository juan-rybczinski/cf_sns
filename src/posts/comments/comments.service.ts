import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentsModel } from './entity/comments.entity';
import { Repository } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { BasePaginationDto } from '../../common/dto/base-pagination.dto';
import { DEFAULT_COMMENT_FIND_OPTIONS } from './const/default-comment-find-options';
import { CommonService } from '../../common/common.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentsModel)
    private readonly commentsRepository: Repository<CommentsModel>,
    private readonly commonService: CommonService,
  ) {}

  getCommentById(id: number) {
    return this.commentsRepository.findOne({
      ...DEFAULT_COMMENT_FIND_OPTIONS,
      where: {
        id,
      },
    });
  }

  async postComments(authorId: number, postId: number, dto: CreateCommentDto) {
    const comment = await this.commentsRepository.save({
      author: {
        id: authorId,
      },
      post: {
        id: postId,
      },
      ...dto,
      likeCount: 0,
    });

    return this.getCommentById(comment.id);
  }

  paginateComments(postId: number, dto: BasePaginationDto) {
    return this.commonService.paginate(
      dto,
      this.commentsRepository,
      DEFAULT_COMMENT_FIND_OPTIONS,
      `posts/${postId}/comments`,
    );
  }
}

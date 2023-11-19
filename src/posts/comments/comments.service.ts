import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  async getCommentById(id: number) {
    const comment = await this.commentsRepository.findOne({
      ...DEFAULT_COMMENT_FIND_OPTIONS,
      where: {
        id,
      },
    });

    if (!comment) {
      throw new BadRequestException(`ID: ${id} Comment는 존재하지 않습니다!`);
    }

    return comment;
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
      {
        ...DEFAULT_COMMENT_FIND_OPTIONS,
        where: {
          post: {
            id: postId,
          },
        },
      },
      `posts/${postId}/comments`,
    );
  }

  async updateComment(id: number, dto: CreateCommentDto) {
    const prev = await this.commentsRepository.preload({
      id,
      ...dto,
    });

    return await this.commentsRepository.save(prev);
  }

  async deleteComment(id: number) {
    const comment = await this.getCommentById(id);
    if (!comment) {
      throw new NotFoundException();
    }

    return this.commentsRepository.delete(id);
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentsModel } from './entity/comments.entity';
import { QueryRunner, Repository } from 'typeorm';
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

  getRepository(qr: QueryRunner) {
    return qr
      ? qr.manager.getRepository<CommentsModel>(CommentsModel)
      : this.commentsRepository;
  }

  async getCommentById(id: number, qr?: QueryRunner) {
    const repository = this.getRepository(qr);

    const comment = await repository.findOne({
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

  async postComments(
    authorId: number,
    postId: number,
    dto: CreateCommentDto,
    qr?: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    const comment = await repository.save({
      author: {
        id: authorId,
      },
      post: {
        id: postId,
      },
      ...dto,
      likeCount: 0,
    });

    return this.getCommentById(comment.id, qr);
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
    const comment = await this.getCommentById(id);
    if (!comment) {
      throw new BadRequestException('존재하지 않는 댓글입니다!');
    }

    const updated = await this.commentsRepository.preload({
      id,
      ...dto,
    });

    return await this.commentsRepository.save(updated);
  }

  async deleteComment(id: number, qr?: QueryRunner) {
    const repository = this.getRepository(qr);

    const comment = await this.getCommentById(id, qr);
    if (!comment) {
      throw new BadRequestException('존재하지 않는 댓글입니다!');
    }

    await repository.delete(id);

    return id;
  }

  isCommentMine(userId: number, commentId: number) {
    return this.commentsRepository.exist({
      where: {
        id: commentId,
        author: {
          id: userId,
        },
      },
      relations: {
        author: true,
      },
    });
  }
}

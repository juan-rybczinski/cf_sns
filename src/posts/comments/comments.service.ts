import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentsModel } from './entity/comments.entity';
import { Repository } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentsModel)
    private readonly commentsRepository: Repository<CommentsModel>,
  ) {}

  getCommentById(id: number) {
    return this.commentsRepository.findOne({
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
}

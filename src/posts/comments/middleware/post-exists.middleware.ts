import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { PostsService } from '../../posts.service';

@Injectable()
export class PostExistsMiddleware implements NestMiddleware {
  constructor(private readonly postsService: PostsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const postId = req.params.postId;

    if (!postId) {
      throw new BadRequestException(' Post ID 파라미터를 입력해주세요!');
    }

    const exists = this.postsService.checkPostExistsById(parseInt(postId));

    if (!exists) {
      throw new BadRequestException(' Post가 존재하지 않습니다!!');
    }

    next();
  }
}

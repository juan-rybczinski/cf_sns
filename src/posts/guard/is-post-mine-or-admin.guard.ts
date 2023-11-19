import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { RolesEnum } from '../../users/const/roles.const';
import { PostsService } from '../posts.service';
import { Request } from 'express';
import { UsersModel } from '../../users/entities/users.entity';

@Injectable()
export class IsPostMineOrAdminGuard implements CanActivate {
  constructor(private readonly postsService: PostsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest() as Request & {
      user: UsersModel;
    };
    const { user } = req;
    if (!user) {
      throw new UnauthorizedException('사용자 정보를 가져올 수 없습니다!');
    }

    if (user.role === RolesEnum.ADMIN) {
      return true;
    }

    const postId = req.params.postId;
    if (!postId) {
      throw new InternalServerErrorException(
        'postId가 파라미터로 제공되어야 합니다!',
      );
    }

    const isOk = await this.postsService.isPostMine(user.id, parseInt(postId));
    if (!isOk) {
      throw new ForbiddenException('권한이 없습니다!');
    }

    return true;
  }
}

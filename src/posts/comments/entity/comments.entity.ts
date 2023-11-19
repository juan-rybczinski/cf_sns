import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseModel } from '../../../common/entity/base.entity';
import { UsersModel } from '../../../users/entities/users.entity';
import { PostsModel } from '../../entities/posts.entity';
import { IsNumber, IsString } from 'class-validator';

@Entity()
export class CommentsModel extends BaseModel {
  @ManyToOne(() => UsersModel, (user) => user.comments)
  author: UsersModel;
  @ManyToOne(() => PostsModel, (post) => post.comments)
  post: PostsModel;
  @Column()
  @IsString()
  comment: string;
  @Column()
  @IsNumber()
  likeCount: number;
}

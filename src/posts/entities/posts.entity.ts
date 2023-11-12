import { Column, Entity, ManyToOne } from 'typeorm';
import { UsersModel } from '../../users/entities/users.entity';
import { BaseModel } from '../../common/entity/base.entity';
import { IsString } from 'class-validator';

@Entity()
export class PostsModel extends BaseModel {
  @ManyToOne(() => UsersModel, (user) => user.posts, {
    nullable: false,
  })
  author: UsersModel;

  @Column()
  @IsString({
    message: 'Title은 String 타입입니다!',
  })
  title: string;

  @Column()
  @IsString({
    message: 'Content는 String 타입입니다!',
  })
  content: string;

  @Column()
  likeCount: number;

  @Column()
  commentCount: number;
}

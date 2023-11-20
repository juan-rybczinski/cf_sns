import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseModel } from '../../common/entity/base.entity';
import { UsersModel } from './users.entity';

@Entity()
export class UserFollowModel extends BaseModel {
  @ManyToOne(() => UsersModel, (user) => user.followers)
  follower: UsersModel;
  @ManyToOne(() => UsersModel, (user) => user.followees)
  followee: UsersModel;
  @Column({
    default: false,
  })
  isConfirmed: boolean;
}

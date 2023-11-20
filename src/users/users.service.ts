import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersModel } from './entities/users.entity';
import { Repository } from 'typeorm';
import { UserFollowModel } from './entities/user-follow.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersModel)
    private readonly usersRepository: Repository<UsersModel>,
    @InjectRepository(UserFollowModel)
    private readonly userFollowRepository: Repository<UserFollowModel>,
  ) {}

  async createUser(user: Pick<UsersModel, 'nickname' | 'email' | 'password'>) {
    const nicknameExist = await this.usersRepository.exist({
      where: {
        nickname: user.nickname,
      },
    });
    if (nicknameExist) {
      throw new BadRequestException('이미 존재하는 Nickname 입니다!');
    }

    const emailExist = await this.usersRepository.exist({
      where: {
        email: user.email,
      },
    });
    if (emailExist) {
      throw new BadRequestException('이미 가입된 Email입니다!');
    }

    const userObject = this.usersRepository.create({
      nickname: user.nickname,
      email: user.email,
      password: user.password,
    });

    return await this.usersRepository.save(userObject);
  }

  async getAllUsers() {
    return await this.usersRepository.find();
  }

  async getUserByEmail(email: string) {
    return await this.usersRepository.findOne({
      where: {
        email,
      },
    });
  }

  async followUser(followerId: number, followeeId: number) {
    return await this.userFollowRepository.save({
      follower: {
        id: followerId,
      },
      followee: {
        id: followeeId,
      },
    });
  }

  async getFollowers(userId: number, includeNotConfirmed: boolean) {
    const where = {
      followee: {
        id: userId,
      },
    };
    if (!includeNotConfirmed) {
      where['isConfirmed'] = true;
    }

    const result = await this.userFollowRepository.find({
      where,
      relations: {
        follower: true,
      },
    });

    return result.map((userFollow) => {
      const { id, nickname, email } = userFollow.follower;

      return { id, nickname, email, isConfirmed: userFollow.isConfirmed };
    });
  }

  async confirmFollow(followerId: number, followeeId: number) {
    const userFollow = await this.userFollowRepository.findOne({
      where: {
        follower: {
          id: followerId,
        },
        followee: {
          id: followeeId,
        },
      },
      relations: {
        follower: true,
        followee: true,
      },
    });

    if (!userFollow) {
      throw new BadRequestException('존재하지 않는 팔로우 요청입니다!');
    }

    return this.userFollowRepository.save({
      ...userFollow,
      isConfirmed: true,
    });
  }

  cancelFollow(followerId: number, followeeId: number) {
    return this.userFollowRepository.delete({
      follower: {
        id: followerId,
      },
      followee: {
        id: followeeId,
      },
    });
  }
}

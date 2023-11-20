import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersModel } from './entities/users.entity';
import { QueryRunner, Repository } from 'typeorm';
import { UserFollowModel } from './entities/user-follow.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersModel)
    private readonly usersRepository: Repository<UsersModel>,
    @InjectRepository(UserFollowModel)
    private readonly userFollowRepository: Repository<UserFollowModel>,
  ) {}

  getUsersRepository(qr: QueryRunner) {
    return qr
      ? qr.manager.getRepository<UsersModel>(UsersModel)
      : this.usersRepository;
  }

  getUserFollowRepository(qr: QueryRunner) {
    return qr
      ? qr.manager.getRepository<UserFollowModel>(UserFollowModel)
      : this.userFollowRepository;
  }

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

  async followUser(followerId: number, followeeId: number, qr?: QueryRunner) {
    const repository = this.getUserFollowRepository(qr);

    return await repository.save({
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

  async confirmFollow(
    followerId: number,
    followeeId: number,
    qr?: QueryRunner,
  ) {
    const repository = this.getUserFollowRepository(qr);

    const userFollow = await repository.findOne({
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

    return repository.save({
      ...userFollow,
      isConfirmed: true,
    });
  }

  async cancelFollow(followerId: number, followeeId: number, qr?: QueryRunner) {
    const usersRepository = this.getUserFollowRepository(qr);
    const userFollowRepository = this.getUserFollowRepository(qr);

    const userFollow = await userFollowRepository.findOne({
      where: {
        followee: {
          id: followeeId,
        },
        follower: {
          id: followerId,
        },
      },
    });

    if (!userFollow) {
      throw new BadRequestException('해당 유저를 팔로우하고 있지 않습니다!');
    }

    await usersRepository.delete({
      follower: {
        id: followerId,
      },
      followee: {
        id: followeeId,
      },
    });

    if (!userFollow.isConfirmed) {
      return true;
    }

    return this.decrementFollowerCount(followeeId, followerId, qr);
  }

  async incrementFollowCount(
    followeeId: number,
    followerId: number,
    qr?: QueryRunner,
  ) {
    const repository = this.getUsersRepository(qr);

    await repository.increment(
      {
        id: followeeId,
      },
      'followerCount',
      1,
    );

    await repository.increment(
      {
        id: followerId,
      },
      'followeeCount',
      1,
    );

    return true;
  }

  async decrementFollowerCount(
    followeeId: number,
    followerId: number,
    qr?: QueryRunner,
  ) {
    const usersRepository = this.getUsersRepository(qr);

    await usersRepository.decrement(
      {
        id: followeeId,
      },
      'followerCount',
      1,
    );

    await usersRepository.decrement(
      {
        id: followerId,
      },
      'followeeCount',
      1,
    );

    return true;
  }
}

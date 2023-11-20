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

  async getFollowers(userId: number) {
    const result = await this.userFollowRepository.find({
      where: {
        followee: {
          id: userId,
        },
      },
      relations: {
        follower: true,
      },
    });

    return result.map((userFollow) => userFollow.follower);
  }
}

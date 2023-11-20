import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersModel } from './entities/users.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersModel)
    private readonly usersRepository: Repository<UsersModel>,
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
    const user = await this.usersRepository.findOne({
      where: {
        id: followeeId,
      },
      relations: {
        followers: true,
      },
    });

    if (!user) {
      throw new BadRequestException('존재하지 않는 팔로워입니다!');
    }

    return await this.usersRepository.save({
      ...user,
      followers: [
        ...user.followers,
        {
          id: followerId,
        },
      ],
    });
  }

  async getFollowers(userId: number) {
    const user = await this.usersRepository.findOne({
      where: {
        id: userId,
      },
      relations: {
        followers: true,
      },
    });

    return user.followers;
  }
}

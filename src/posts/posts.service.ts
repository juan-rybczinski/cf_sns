import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostsModel } from './entities/posts.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatePostDto } from './dto/paginate-post.dto';
import { CommonService } from '../common/common.service';
import { basename, join } from 'path';
import { POST_IMAGE_PATH, TEMP_FOLDER_PATH } from '../common/const/paths.const';
import { promises } from 'fs';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsModel)
    private readonly postsRepository: Repository<PostsModel>,
    private readonly commonService: CommonService,
  ) {}

  async getAllPosts() {
    return this.postsRepository.find({
      relations: {
        author: true,
      },
    });
  }

  async paginatePosts(dto: PaginatePostDto) {
    return this.commonService.paginate(
      dto,
      this.postsRepository,
      { relations: ['author'] },
      'posts',
    );
  }

  async getPostById(id: number) {
    const post = await this.postsRepository.findOne({
      relations: {
        author: true,
      },
      where: { id },
    });

    if (!post) {
      throw new NotFoundException();
    }

    return post;
  }

  async generatePosts(userId: number) {
    for (let i = 0; i < 100; i++) {
      await this.createPost(userId, {
        title: `임의로 생성된 포스트 제목 ${i}`,
        content: `임의로 생성된 포스트 내용 ${i}`,
      });
    }
  }

  async createPostImage(dto: CreatePostDto) {
    const tempFilePath = join(TEMP_FOLDER_PATH, dto.image);
    try {
      await promises.access(tempFilePath);
    } catch (e) {
      throw new BadRequestException('임시 파일이 존재하지 않습니다!');
    }

    const fileName = basename(tempFilePath);
    const publicFilePath = join(POST_IMAGE_PATH, fileName);
    await promises.rename(tempFilePath, publicFilePath);

    return true;
  }

  async createPost(authorId: number, postDto: CreatePostDto) {
    await this.createPostImage(postDto);

    const post = this.postsRepository.create({
      author: {
        id: authorId,
      },
      ...postDto,
      likeCount: 0,
      commentCount: 0,
    });

    return await this.postsRepository.save(post);
  }

  async updatePost(id: number, postDto: UpdatePostDto) {
    const { title, content } = postDto;

    const post = await this.postsRepository.findOne({
      where: { id },
    });

    if (!post) {
      throw new NotFoundException();
    }

    if (title) {
      post.title = title;
    }

    if (content) {
      post.content = content;
    }

    return await this.postsRepository.save(post);
  }

  async deletePost(id: number) {
    const post = this.postsRepository.findOne({
      where: { id },
    });

    if (!post) {
      throw new NotFoundException();
    }

    await this.postsRepository.delete(id);

    return id;
  }
}

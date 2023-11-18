import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PostsModel } from './entities/posts.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatePostDto } from './dto/paginate-post.dto';
import { CommonService } from '../common/common.service';
import { ImageModelType } from '../common/entity/image.entity';
import { DEFAULT_POST_FIND_OPTIONS } from './const/default-post-find-options.const';
import { ImagesService } from './image/images.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsModel)
    private readonly postsRepository: Repository<PostsModel>,
    private readonly imagesService: ImagesService,
    private readonly commonService: CommonService,
    private readonly dataSource: DataSource,
  ) {}

  async getAllPosts() {
    return this.postsRepository.find({
      ...DEFAULT_POST_FIND_OPTIONS,
    });
  }

  async paginatePosts(dto: PaginatePostDto) {
    return this.commonService.paginate(
      dto,
      this.postsRepository,
      { ...DEFAULT_POST_FIND_OPTIONS },
      'posts',
    );
  }

  async getPostById(id: number) {
    const post = await this.postsRepository.findOne({
      ...DEFAULT_POST_FIND_OPTIONS,
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
        images: [],
      });
    }
  }

  async createPost(authorId: number, postDto: CreatePostDto) {
    const qr = this.dataSource.createQueryRunner();
    const repository = qr.manager.getRepository<PostsModel>(PostsModel);
    await qr.connect();
    await qr.startTransaction();

    let created: PostsModel;
    try {
      const post = repository.create({
        author: {
          id: authorId,
        },
        ...postDto,
        images: [],
        likeCount: 0,
        commentCount: 0,
      });

      created = await repository.save(post);

      for (let i = 0; i < postDto.images.length; i++) {
        await this.imagesService.createPostImage(
          {
            post: created,
            order: i,
            path: postDto.images[i],
            type: ImageModelType.postImage,
          },
          qr,
        );
      }
      await qr.commitTransaction();
    } catch (e) {
      await qr.rollbackTransaction();
      throw new InternalServerErrorException('Post 저장에 실패했습니다!');
    } finally {
      await qr.release();
    }

    return this.getPostById(created.id);
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

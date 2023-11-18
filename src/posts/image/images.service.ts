import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ImageModel } from '../../common/entity/image.entity';
import { QueryRunner, Repository } from 'typeorm';
import { CreatePostImageDto } from './dto/create-image.dto';
import { basename, join } from 'path';
import {
  POST_IMAGE_PATH,
  TEMP_FOLDER_PATH,
} from '../../common/const/paths.const';
import { promises } from 'fs';

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(ImageModel)
    private readonly imageRepository: Repository<ImageModel>,
  ) {}

  async createPostImage(postDto: CreatePostImageDto, qr: QueryRunner) {
    const repository = qr.manager.getRepository<ImageModel>(ImageModel);

    const tempFilePath = join(TEMP_FOLDER_PATH, postDto.path);
    try {
      await promises.access(tempFilePath);
    } catch (e) {
      throw new BadRequestException('임시 파일이 존재하지 않습니다!');
    }

    const fileName = basename(tempFilePath);
    const publicFilePath = join(POST_IMAGE_PATH, fileName);

    const result = await repository.save({
      ...postDto,
    });

    await promises.rename(tempFilePath, publicFilePath);

    return result;
  }
}

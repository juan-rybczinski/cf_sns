import { Injectable } from '@nestjs/common';
import { BaseModel } from './entity/base.entity';
import { BasePaginationDto } from './dto/base-pagination.dto';
import { FindManyOptions, Repository } from 'typeorm';

@Injectable()
export class CommonService {
  paginate<T extends BaseModel>(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
    path: string,
  ) {}
}

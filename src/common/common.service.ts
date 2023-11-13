import { Injectable } from '@nestjs/common';
import { BaseModel } from './entity/base.entity';
import { BasePaginationDto } from './dto/base-pagination.dto';
import { FindManyOptions, Repository } from 'typeorm';

@Injectable()
export class CommonService {
  prviate;

  paginate<T extends BaseModel>(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
    path: string,
  ) {}

  async cursorPaginate(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
    path: string,
  ) {}

  private async pagePaginate(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
  ) {}

  private composeFindOptions<T extends BaseModel>(
    dto: BasePaginationDto,
  ): FindManyOptions<T> {}
}

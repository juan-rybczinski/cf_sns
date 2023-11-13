import { BadRequestException, Injectable } from '@nestjs/common';
import { BaseModel } from './entity/base.entity';
import { BasePaginationDto } from './dto/base-pagination.dto';
import {
  FindManyOptions,
  FindOptionsOrder,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { FILTER_MAPPER } from './const/filter-mapper.const';
import { HOST, PROTOCOL } from './const/env.const';

@Injectable()
export class CommonService {
  prviate;

  async paginate<T extends BaseModel>(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
    path: string,
  ) {
    if (dto.page) {
      return this.pagePaginate(dto, repository, overrideFindOptions);
    } else {
      return this.cursorPaginate(dto, repository, overrideFindOptions, path);
    }
  }

  async cursorPaginate<T extends BaseModel>(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
    path: string,
  ) {
    const findOptions = this.composeFindOptions<T>(dto);
    const data = await repository.find({
      ...findOptions,
      ...overrideFindOptions,
    });

    const lastItem = data.length === dto.take ? data[data.length - 1] : null;

    const nextUrl = lastItem && new URL(`${PROTOCOL}://${HOST}/${path}`);
    if (nextUrl) {
      for (const key of Object.keys(dto)) {
        if (key !== 'where__id__more_than' && key !== 'where__id__less_than') {
          nextUrl.searchParams.append(key, dto[key]);
        }
      }

      let key: string;
      if (dto.order__createdAt === 'ASC') {
        key = 'where__id__more_than';
      } else {
        key = 'where__id__less_than';
      }
      nextUrl.searchParams.append(key, lastItem.id.toString());
    }

    return {
      data,
      cursor: {
        after: lastItem?.id ?? null,
      },
      count: data.length,
      next: nextUrl?.toString() ?? null,
    };
  }

  private async pagePaginate<T extends BaseModel>(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
  ) {}

  private composeFindOptions<T extends BaseModel>(
    dto: BasePaginationDto,
  ): FindManyOptions<T> {
    let where: FindOptionsWhere<T> = {};
    let order: FindOptionsOrder<T> = {};

    for (const [key, value] of Object.entries(dto)) {
      if (key.startsWith('where__')) {
        where = {
          ...where,
          ...this.parseWhereFilter(key, value),
        };
      } else if (key.startsWith('order__')) {
        order = {
          ...order,
          ...this.parseOrderFilter(key, value),
        };
      }
    }

    return {
      where,
      order,
      take: dto.take,
      skip: dto.page ? dto.take * (dto.page - 1) : null,
    };
  }

  private parseWhereFilter<T extends BaseModel>(
    key: string,
    value: any,
  ): FindOptionsWhere<T> {
    const options: FindOptionsWhere<T> = {};

    const split = key.split('__');
    if (split.length !== 2 && split.length !== 3) {
      throw new BadRequestException(
        `where 필터는 '__'로 split 했을때 길이가 2 또는 3이어야합니다 - 문제되는 키값 : ${key}`,
      );
    }

    if (split.length === 2) {
      const [_, field] = split;
      options[field] = value;
    } else if (split.length === 3) {
      const [_, field, operator] = split;
      const values = value.toString().split(',');
      options[field] = FILTER_MAPPER[operator](
        values.length > 1 ? values : value,
      );
    }

    return options;
  }

  private parseOrderFilter<T extends BaseModel>(
    key: string,
    value: any,
  ): FindOptionsOrder<T> {
    const options: FindOptionsOrder<T> = {};

    const split = key.split('__');
    if (split.length !== 2) {
      throw new BadRequestException(
        `where 필터는 '__'로 split 했을때 길이가 2이어야합니다 - 문제되는 키값 : ${key}`,
      );
    }

    const [_, field] = split;
    options[field] = value;

    return options;
  }
}

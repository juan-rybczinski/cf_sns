import { IsIn, IsNumber, IsOptional } from 'class-validator';

export class PaginatePostDto {
  // @Type(() => Number)
  @IsNumber()
  @IsOptional()
  where__id_more_that?: number;

  @IsIn(['ASC'])
  @IsOptional()
  order__createdAt: 'ASC' = 'ASC';

  @IsNumber()
  @IsOptional()
  take: number = 20;
}

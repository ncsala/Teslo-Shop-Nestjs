import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Min } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsPositive()
  // Para hacer conversion a number del limit q
  // vendra por Query
  // Tambien se puede poner en main.ts en useGlobalPipes
  // transformOptions: {
  // enableImplicitConversion: true,
  // }
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  // Para hacer conversion a number del offset q
  // vendra por Query
  @Min(0)
  @Type(() => Number)
  offset?: number;
}

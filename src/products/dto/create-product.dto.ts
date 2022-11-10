import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
  IsIn,
  IsLowercase,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @IsLowercase()
  slug?: string;

  @IsInt()
  @IsPositive()
  @IsOptional()
  stock?: number;

  // Cada valor del array sea string
  @IsString({ each: true })
  @IsArray()
  sizes?: string[];

  @IsIn(['men', 'women', 'kid', 'unisex'])
  gender: string;

  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  tags: string[];
}

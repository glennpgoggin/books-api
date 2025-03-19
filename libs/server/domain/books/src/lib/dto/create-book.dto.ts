import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BookStatus } from '@shared/support/interfaces';
import { AuthorRoleDto } from './create-author.dto';

export class CreateBookDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  isbn?: string;

  @IsOptional()
  @IsDateString()
  publishedDate?: string;

  @IsOptional()
  @IsString()
  edition?: string;

  @IsOptional()
  @IsString()
  format?: string;

  @IsOptional()
  @IsString()
  genre?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(BookStatus)
  status?: BookStatus = BookStatus.Draft;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AuthorRoleDto)
  authors?: AuthorRoleDto[];
}

import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  IsDateString,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BookFormat, BookGenre, BookStatus } from '@shared/support/interfaces';
import { AuthorRoleDto } from './create-author.dto';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  isbn?: string;

  @IsOptional()
  @IsDateString()
  publishedDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  edition?: string;

  @IsOptional()
  @IsEnum(BookGenre)
  genre?: BookGenre;

  @IsOptional()
  @IsEnum(BookFormat)
  format?: BookFormat;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
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

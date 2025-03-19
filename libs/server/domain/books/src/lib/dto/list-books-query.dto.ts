import { IsOptional, IsInt, Min, IsIn, IsUUID, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { BookStatus, BookGenre, BookFormat } from '@shared/support/interfaces';

export class ListBooksQueryDto {
  @IsOptional()
  @IsUUID()
  authorId?: string;

  @IsOptional()
  @IsEnum(BookStatus)
  status?: BookStatus;

  @IsOptional()
  @IsEnum(BookGenre)
  genre?: BookGenre;

  @IsOptional()
  @IsEnum(BookFormat)
  format?: BookFormat;

  @IsOptional()
  @IsIn(['title', 'createdAt'])
  sortBy = 'createdAt';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder: 'asc' | 'desc' = 'desc';

  @IsOptional()
  @IsUUID()
  cursor?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  take = 20;
}

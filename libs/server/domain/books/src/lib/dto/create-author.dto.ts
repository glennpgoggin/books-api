import { IsString, IsOptional, IsEnum } from 'class-validator';
import { BookAuthorRole } from '@shared/support/interfaces';

export class CreateAuthorDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  bio?: string;
}

export class AuthorRoleDto {
  @IsString()
  authorId!: string;

  @IsEnum(BookAuthorRole)
  role!: BookAuthorRole;
}

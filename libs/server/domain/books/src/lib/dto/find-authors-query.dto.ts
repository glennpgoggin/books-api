import { IsArray, ArrayNotEmpty, IsUUID } from 'class-validator';

export class FindAuthorsQueryDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('all', { each: true })
  ids?: string[];
}

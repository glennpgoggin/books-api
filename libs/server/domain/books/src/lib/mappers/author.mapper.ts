import { Author } from '@shared/support/interfaces';
import { AuthorEntity } from '../entities/author.entity';

export function mapAuthorEntityToResponse(author: AuthorEntity): Author {
  return {
    id: author.id,
    name: author.name,
    bio: author.bio !== null ? author.bio : undefined,
  };
}

import { mapAuthorEntityToResponse } from './author.mapper';
import { AuthorEntity } from '../entities/author.entity';

describe('mapAuthorEntityToResponse', () => {
  const mockAuthorEntity: AuthorEntity = {
    id: 'author-123',
    name: 'J.R.R. Tolkien',
    bio: 'Legendary author and philologist.',
  };

  it('maps all fields correctly when bio is present', () => {
    const result = mapAuthorEntityToResponse(mockAuthorEntity);
    expect(result).toEqual({
      id: 'author-123',
      name: 'J.R.R. Tolkien',
      bio: 'Legendary author and philologist.',
    });
  });

  it('maps bio to undefined when bio is null', () => {
    const authorWithNullBio: AuthorEntity = {
      id: 'author-124',
      name: 'Author Without Bio',
      bio: null,
    };

    const result = mapAuthorEntityToResponse(authorWithNullBio);
    expect(result).toEqual({
      id: 'author-124',
      name: 'Author Without Bio',
      bio: undefined,
    });
  });

  it('handles an author with an empty string bio (treated as is)', () => {
    const authorWithEmptyBio: AuthorEntity = {
      id: 'author-125',
      name: 'Author With Empty Bio',
      bio: '',
    };

    const result = mapAuthorEntityToResponse(authorWithEmptyBio);
    expect(result).toEqual({
      id: 'author-125',
      name: 'Author With Empty Bio',
      bio: '',
    });
  });
});

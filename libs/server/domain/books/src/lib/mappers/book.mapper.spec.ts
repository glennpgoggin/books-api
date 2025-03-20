import { mapBookEntityToResponse } from './book.mapper';
import { BookEntity } from '../entities/book.entity';

describe('mapBookEntityToResponse', () => {
  const baseDate = new Date('2025-01-01T00:00:00Z');

  const mockBookEntity: BookEntity & {
    authors: {
      author: { id: string; name: string; bio: string | null };
      role: string;
    }[];
  } = {
    id: 'book-123',
    slug: 'the-hobbit',
    title: 'The Hobbit',
    isbn: '978-12345',
    publishedDate: baseDate,
    edition: 'First Edition',
    format: 'Hardcover',
    genre: 'Fantasy',
    description: 'A great adventure.',
    status: 'published',
    createdAt: baseDate,
    updatedAt: baseDate,
    deletedAt: null,
    authors: [
      {
        id: 'bookauthor-1',
        createdAt: baseDate,
        bookId: 'book-123',
        authorId: 'author-1',
        role: 'author',
        author: {
          id: 'author-1',
          name: 'J.R.R. Tolkien',
          bio: 'Legendary author.',
        },
      },
    ],
  };

  it('maps all fields correctly for a fully populated entity', () => {
    const result = mapBookEntityToResponse(mockBookEntity);
    expect(result).toEqual({
      id: 'book-123',
      slug: 'the-hobbit',
      title: 'The Hobbit',
      isbn: '978-12345',
      publishedDate: baseDate.toISOString(),
      edition: 'First Edition',
      format: 'Hardcover',
      genre: 'Fantasy',
      description: 'A great adventure.',
      status: 'published',
      createdAt: baseDate.toISOString(),
      updatedAt: baseDate.toISOString(),
      deletedAt: undefined,
      authors: [
        {
          author: {
            id: 'author-1',
            name: 'J.R.R. Tolkien',
            bio: 'Legendary author.',
          },
          role: 'author',
        },
      ],
    });
  });

  it('handles null or missing optional fields and maps them to undefined', () => {
    const entityWithNulls = {
      ...mockBookEntity,
      isbn: null,
      publishedDate: null,
      edition: null,
      format: null,
      genre: null,
      description: null,
      deletedAt: null,
    };
    const result = mapBookEntityToResponse(entityWithNulls);
    expect(result.isbn).toBeUndefined();
    expect(result.publishedDate).toBeUndefined();
    expect(result.edition).toBeUndefined();
    expect(result.format).toBeUndefined();
    expect(result.genre).toBeUndefined();
    expect(result.description).toBeUndefined();
    expect(result.deletedAt).toBeUndefined();
  });

  it('correctly maps authors array to response authors with mapped author fields', () => {
    const result = mapBookEntityToResponse(mockBookEntity);
    expect(result.authors).toHaveLength(1);
    expect(result.authors[0]).toEqual({
      author: {
        id: 'author-1',
        name: 'J.R.R. Tolkien',
        bio: 'Legendary author.',
      },
      role: 'author',
    });
  });

  it('returns an empty authors array if no authors are present', () => {
    const entityWithoutAuthors = {
      ...mockBookEntity,
      authors: [],
    };
    const result = mapBookEntityToResponse(entityWithoutAuthors);
    expect(result.authors).toEqual([]);
  });

  it('maps dates to ISO strings consistently', () => {
    const result = mapBookEntityToResponse(mockBookEntity);
    expect(result.createdAt).toEqual(baseDate.toISOString());
    expect(result.updatedAt).toEqual(baseDate.toISOString());
  });

  it('maintains status and role enums as string values', () => {
    const result = mapBookEntityToResponse(mockBookEntity);
    expect(result.status).toBe('published');
    expect(result.authors[0].role).toBe('author');
  });
});

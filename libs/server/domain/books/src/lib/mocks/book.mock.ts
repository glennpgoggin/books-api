import { BookAuthorRole, BookStatus } from '@shared/support/interfaces';

export function createMockBookEntity(overrides = {}) {
  return {
    id: 'book-1',
    slug: 'test-slug',
    title: 'Test Book',
    isbn: '978-1234567890',
    publishedDate: new Date(),
    edition: '1st',
    format: 'Hardcover',
    genre: 'Fantasy',
    description: 'A test description for the book.',
    status: BookStatus.Published,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    authors: [
      {
        id: 'rel-1',
        createdAt: new Date(),
        bookId: 'book-1',
        authorId: 'author-1',
        role: BookAuthorRole.Author,
        author: {
          id: 'author-1',
          name: 'J.R.R. Tolkien',
          bio: 'Legendary author.',
        },
      },
    ],
    ...overrides,
  };
}

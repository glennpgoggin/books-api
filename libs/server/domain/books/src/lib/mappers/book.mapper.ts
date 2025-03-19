import { Book, Author, BookAuthorRole } from '@shared/support/interfaces';
import { BookEntity } from '../entities/book.entity';
import { mapAuthorEntityToResponse } from './author.mapper';

export function mapBookEntityToResponse(
  book: BookEntity & {
    authors: { author: Author; role: string }[];
  }
): Book {
  return {
    id: book.id,
    slug: book.slug,
    title: book.title,
    isbn: book.isbn || undefined,
    publishedDate: book.publishedDate?.toISOString(),
    edition: book.edition || undefined,
    format: book.format || undefined,
    genre: book.genre || undefined,
    description: book.description || undefined,
    status: book.status as Book['status'],
    createdAt: book.createdAt.toISOString(),
    updatedAt: book.updatedAt.toISOString(),
    deletedAt: book.deletedAt?.toISOString(),
    authors: book.authors.map((a) => ({
      author: mapAuthorEntityToResponse(a.author),
      role: a.role as BookAuthorRole,
    })),
  };
}

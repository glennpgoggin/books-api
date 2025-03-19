import { Author } from './author.interface';

export interface Book {
  id: string;
  slug: string;
  title: string;
  isbn?: string;
  publishedDate?: string; // ISO date string
  edition?: string;
  format?: string;
  genre?: string;
  description?: string;
  status: BookStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  authors: BookAuthor[];
}

export interface BookAuthor {
  author: Author;
  role: BookAuthorRole;
}

export enum BookStatus {
  Draft = 'draft',
  Published = 'published',
  Archived = 'archived',
}

export enum BookAuthorRole {
  Author = 'author',
  Editor = 'editor',
  Contributor = 'contributor',
}

export enum BookFormat {
  Hardcover = 'hardcover',
  Paperback = 'paperback',
  Ebook = 'ebook',
  Audiobook = 'audiobook',
}

export enum BookGenre {
  Fiction = 'fiction',
  NonFiction = 'non_fiction',
  Fantasy = 'fantasy',
  Science = 'science',
  Biography = 'biography',
  History = 'history',
  Other = 'other',
}

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
  Draft = 'DRAFT',
  Published = 'PUBLISHED',
  Archived = 'ARCHIVED',
}

export enum BookAuthorRole {
  Author = 'Author',
  Editor = 'Editor',
  Contributor = 'Contributor',
}

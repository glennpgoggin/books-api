import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@server/support/database';
import { CreateBookDto } from '../dto/create-book.dto';
import { BookStatus } from '@shared/support/interfaces';
import { BookEntity } from '../entities/book.entity';
import { UpdateBookDto } from '../dto/update-book.dto';

@Injectable()
export class BooksRepository {
  private includeRelations = {
    authors: { include: { author: true } },
  };
  constructor(public readonly db: DatabaseService) {}

  async findAll(): Promise<BookEntity[]> {
    return this.db.book.findMany({
      include: this.includeRelations,
    });
  }

  async findAllIncludingDeleted(): Promise<BookEntity[]> {
    return await (this.db.book as any).findManyIncludingDeleted({
      include: this.includeRelations,
    });
  }

  async findById(id: string): Promise<BookEntity | null> {
    return this.db.book.findUnique({
      where: { id },
      include: this.includeRelations,
    });
  }

  async findByKey<K extends keyof BookEntity>(
    key: K,
    value: BookEntity[K]
  ): Promise<BookEntity | null> {
    return this.db.book.findFirst({
      where: { [key]: value },
      include: this.includeRelations,
    });
  }

  async create(dto: CreateBookDto, slug: string): Promise<BookEntity> {
    const authors = dto.authors ?? [];
    const status = dto.status ?? BookStatus.Draft;

    return this.db.book.create({
      data: {
        slug,
        title: dto.title,
        isbn: dto.isbn,
        publishedDate: status === BookStatus.Published ? new Date() : null,
        edition: dto.edition,
        format: dto.format,
        genre: dto.genre,
        description: dto.description,
        status: status,
        authors: {
          create: authors.map((a) => ({
            role: a.role,
            author: { connect: { id: a.authorId } },
          })),
        },
      },
      include: this.includeRelations,
    });
  }

  async update(id: string, dto: UpdateBookDto): Promise<BookEntity> {
    const existingBook = await this.db.book.findUnique({ where: { id } });

    const shouldSetPublishedDate =
      dto.status === BookStatus.Published &&
      existingBook?.status !== BookStatus.Published &&
      !dto.publishedDate;

    return this.db.book.update({
      where: { id },
      data: {
        title: dto.title,
        isbn: dto.isbn,
        publishedDate: dto.publishedDate
          ? new Date(dto.publishedDate)
          : shouldSetPublishedDate
          ? new Date()
          : existingBook?.publishedDate,
        edition: dto.edition,
        format: dto.format,
        genre: dto.genre,
        description: dto.description,
        status: dto.status ?? BookStatus.Draft,
      },
      include: this.includeRelations,
    });
  }

  async softDelete(id: string): Promise<void> {
    await (this.db.book as any).softDelete({ where: { id } });
  }

  async delete(id: string): Promise<void> {
    await this.db.book.delete({ where: { id } });
  }

  async restore(id: string): Promise<BookEntity> {
    return this.db.book.update({
      where: { id },
      data: { deletedAt: null },
      include: this.includeRelations,
    });
  }

  async addAuthorToBook(
    bookId: string,
    authorId: string,
    role: string
  ): Promise<void> {
    await this.db.bookAuthor.create({
      data: {
        book: { connect: { id: bookId } },
        author: { connect: { id: authorId } },
        role,
      },
    });
  }

  async removeAuthorFromBook(bookId: string, authorId: string): Promise<void> {
    await this.db.bookAuthor.deleteMany({
      where: { bookId, authorId },
    });
  }
}

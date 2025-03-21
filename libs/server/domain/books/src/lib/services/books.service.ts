import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BooksRepository } from '../repositories/books.repository';
import { CreateBookDto } from '../dto/create-book.dto';
import { UpdateBookDto } from '../dto/update-book.dto';
import { mapBookEntityToResponse } from '../mappers/book.mapper';
import { Book, PaginatedResponse } from '@shared/support/interfaces';
import slugify from 'slugify';
import { generateUniqueSlug } from '@server/support/database';
import { ListBooksQueryDto } from '../dto/list-books-query.dto';
import { AuthorsRepository } from '../repositories/authors.repository';

@Injectable()
export class BooksService {
  constructor(
    private readonly booksRepository: BooksRepository,
    private readonly authorsRepository: AuthorsRepository
  ) {}

  async list(query: ListBooksQueryDto): Promise<PaginatedResponse<Book>> {
    const result = await this.booksRepository.list(query);
    return {
      ...result,
      items: result.items.map(mapBookEntityToResponse),
    };
  }

  async getById(id: string): Promise<Book> {
    const book = await this.booksRepository.getById(id);
    if (!book) throw new NotFoundException('Book not found');
    return mapBookEntityToResponse(book);
  }

  async create(dto: CreateBookDto): Promise<Book> {
    if (dto.isbn) {
      const existingIsbn = await this.booksRepository.findByKey(
        'isbn',
        dto.isbn
      );
      if (existingIsbn) {
        throw new ConflictException(
          `A book with ISBN ${dto.isbn} already exists.`
        );
      }
    }

    const authorIds = dto.authors?.map((a) => a.authorId) ?? [];
    if (authorIds.length > 0) {
      const existingAuthors = await this.authorsRepository.findByIds({
        ids: authorIds,
      });
      const existingAuthorIds = existingAuthors.map((a) => a.id);
      const missingAuthorIds = authorIds.filter(
        (id) => !existingAuthorIds.includes(id)
      );

      if (missingAuthorIds.length > 0) {
        throw new BadRequestException(
          `The following author IDs do not exist: ${missingAuthorIds.join(
            ', '
          )}`
        );
      }
    }

    const baseSlug = slugify(dto.title, { lower: true, strict: true });
    const uniqueSlug = await generateUniqueSlug(
      (args) => this.booksRepository.db.book.findUnique(args),
      baseSlug
    );

    const book = await this.booksRepository.create(dto, uniqueSlug);
    return mapBookEntityToResponse(book);
  }

  async update(id: string, data: UpdateBookDto): Promise<Book> {
    const book = await this.booksRepository.update(id, data);
    return mapBookEntityToResponse(book);
  }

  async softDelete(id: string): Promise<void> {
    const book = await this.booksRepository.getById(id);
    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found.`);
    }
    if (book.deletedAt) {
      throw new ConflictException(`Book with ID ${id} is already archived.`);
    }

    await this.booksRepository.softDelete(id);
  }

  async delete(id: string): Promise<void> {
    const book = await this.booksRepository.getById(id);
    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found.`);
    }

    await this.booksRepository.delete(id);
  }

  async restore(id: string): Promise<Book> {
    const book = await this.booksRepository.getById(id);
    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found.`);
    }
    if (!book.deletedAt) {
      throw new ConflictException(`Book with ID ${id} is not archived.`);
    }

    const restoredBook = await this.booksRepository.restore(id);
    return mapBookEntityToResponse(restoredBook);
  }

  async addAuthor(
    bookId: string,
    authorId: string,
    role: string
  ): Promise<Book> {
    const book = await this.booksRepository.getById(bookId);
    if (!book) throw new NotFoundException('Book not found.');

    // TODO
    // const author = await this.booksRepository.findAuthorById(authorId);
    // if (!author) throw new NotFoundException('Author not found.');

    await this.booksRepository.addAuthorToBook(bookId, authorId, role);

    const updatedBook = await this.booksRepository.getById(bookId);
    return mapBookEntityToResponse(updatedBook!);
  }

  async removeAuthor(bookId: string, authorId: string): Promise<Book> {
    await this.booksRepository.removeAuthorFromBook(bookId, authorId);
    const updatedBook = await this.booksRepository.getById(bookId);
    return mapBookEntityToResponse(updatedBook!);
  }
}

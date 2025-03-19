import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BooksRepository } from '../repositories/books.repository';
import { CreateBookDto } from '../dto/create-book.dto';
import { UpdateBookDto } from '../dto/update-book.dto';
import { mapBookEntityToResponse } from '../mappers/book.mapper';
import { Book } from '@shared/support/interfaces';
import slugify from 'slugify';
import { generateUniqueSlug } from '@server/support/database';

@Injectable()
export class BooksService {
  constructor(private readonly booksRepository: BooksRepository) {}

  async findAll(): Promise<Book[]> {
    const books = await this.booksRepository.findAll();
    return books.map(mapBookEntityToResponse);
  }

  async findById(id: string): Promise<Book> {
    const book = await this.booksRepository.findById(id);
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
    const book = await this.booksRepository.findById(id);
    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found.`);
    }
    if (book.deletedAt) {
      throw new ConflictException(`Book with ID ${id} is already archived.`);
    }

    await this.booksRepository.softDelete(id);
  }

  async delete(id: string): Promise<void> {
    const book = await this.booksRepository.findById(id);
    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found.`);
    }

    await this.booksRepository.delete(id);
  }

  async restore(id: string): Promise<Book> {
    const book = await this.booksRepository.findById(id);
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
    const book = await this.booksRepository.findById(bookId);
    if (!book) throw new NotFoundException('Book not found.');

    // TODO
    // const author = await this.booksRepository.findAuthorById(authorId);
    // if (!author) throw new NotFoundException('Author not found.');

    await this.booksRepository.addAuthorToBook(bookId, authorId, role);

    const updatedBook = await this.booksRepository.findById(bookId);
    return mapBookEntityToResponse(updatedBook!);
  }

  async removeAuthor(bookId: string, authorId: string): Promise<Book> {
    await this.booksRepository.removeAuthorFromBook(bookId, authorId);
    const updatedBook = await this.booksRepository.findById(bookId);
    return mapBookEntityToResponse(updatedBook!);
  }
}

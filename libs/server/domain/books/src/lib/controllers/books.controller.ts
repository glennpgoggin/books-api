import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Put,
} from '@nestjs/common';
import { BooksService } from '../services/books.service';
import { CreateBookDto } from '../dto/create-book.dto';
import { UpdateBookDto } from '../dto/update-book.dto';
import { ApiResponse, apiResponse, Book } from '@shared/support/interfaces';
import { AuthorRoleDto } from '../dto/create-author.dto';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  async findAll(): Promise<ApiResponse<Book[]>> {
    const books = await this.booksService.findAll();
    return apiResponse(books);
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<ApiResponse<Book>> {
    const book = await this.booksService.findById(id);
    return apiResponse(book);
  }

  @Post()
  async create(
    @Body() createBookDto: CreateBookDto
  ): Promise<ApiResponse<Book>> {
    const book = await this.booksService.create(createBookDto);
    return apiResponse(book, 201, 'Book created successfully');
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBookDto: UpdateBookDto
  ): Promise<Book> {
    return this.booksService.update(id, updateBookDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.booksService.softDelete(id);
  }

  @Delete(':id/force')
  async purge(@Param('id') id: string): Promise<void> {
    return this.booksService.delete(id);
  }

  @Post(':id/restore')
  async restore(@Param('id') id: string) {
    const book = await this.booksService.restore(id);
    return apiResponse(book, 200, 'Book restored successfully');
  }

  @Post(':id/authors')
  async addAuthor(
    @Param('id') id: string,
    @Body() authorRoleDto: AuthorRoleDto
  ) {
    const book = await this.booksService.addAuthor(
      id,
      authorRoleDto.authorId,
      authorRoleDto.role
    );
    return apiResponse(book, 200, 'Author added successfully');
  }

  @Delete(':id/authors/:authorId')
  async removeAuthor(
    @Param('id') id: string,
    @Param('authorId') authorId: string
  ) {
    const book = await this.booksService.removeAuthor(id, authorId);
    return apiResponse(book, 200, 'Author removed successfully');
  }
}

import { Module } from '@nestjs/common';
import { BooksController } from './controllers/books.controller';
import { BooksService } from './services/books.service';
import { BooksRepository } from './repositories/books.repository';
import { DatabaseModule } from '@server/support/database';
import { AuthorsController } from './controllers/authors.controller';
import { AuthorsService } from './services/authors.service';
import { AuthorsRepository } from './repositories/authors.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [BooksController, AuthorsController],
  providers: [BooksService, BooksRepository, AuthorsService, AuthorsRepository],
  exports: [BooksService, AuthorsService],
})
export class BooksModule {}

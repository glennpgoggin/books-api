import { Test, TestingModule } from '@nestjs/testing';
import { BooksService } from './books.service';
import { BooksRepository } from '../repositories/books.repository';
import { AuthorsRepository } from '../repositories/authors.repository';
import {
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { createMockBookEntity } from '../mocks/book.mock';
import { createMockAuthorEntity } from '../mocks/author.mock';
import { BookAuthorRole } from '@shared/support/interfaces';

jest.mock('@server/support/database', () => ({
  generateUniqueSlug: jest.fn().mockResolvedValue('unique-slug'),
}));

describe('BooksService', () => {
  let service: BooksService;
  let booksRepository: jest.Mocked<BooksRepository>;
  let authorsRepository: jest.Mocked<AuthorsRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        {
          provide: BooksRepository,
          useValue: {
            findByKey: jest.fn(),
            create: jest.fn(),
            getById: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
            delete: jest.fn(),
            restore: jest.fn(),
            addAuthorToBook: jest.fn(),
            removeAuthorFromBook: jest.fn(),
          },
        },
        {
          provide: AuthorsRepository,
          useValue: {
            findByIds: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(BooksService);
    booksRepository = module.get(BooksRepository);
    authorsRepository = module.get(AuthorsRepository);
  });

  describe('create', () => {
    it('throws ConflictException if ISBN exists', async () => {
      booksRepository.findByKey.mockResolvedValueOnce(createMockBookEntity());
      await expect(
        service.create({ title: 'Test Book', isbn: '1234' })
      ).rejects.toThrow(ConflictException);
    });

    it('throws BadRequestException if author IDs are invalid', async () => {
      authorsRepository.findByIds.mockResolvedValueOnce([
        createMockAuthorEntity(),
      ]);
      await expect(
        service.create({
          title: 'Test Book',
          authors: [
            { authorId: 'author-1', role: BookAuthorRole.Author },
            { authorId: 'missing-author', role: BookAuthorRole.Author },
          ],
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('creates a book and returns mapped response', async () => {
      booksRepository.findByKey.mockResolvedValueOnce(null);
      authorsRepository.findByIds.mockResolvedValueOnce([
        createMockAuthorEntity(),
      ]);
      booksRepository.create.mockResolvedValueOnce(createMockBookEntity());
      const mapSpy = jest
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        .spyOn(require('../mappers/book.mapper'), 'mapBookEntityToResponse')
        .mockReturnValue({ id: 'mapped-book' });

      const result = await service.create({
        title: 'Test Book',
        authors: [{ authorId: 'author-1', role: BookAuthorRole.Author }],
      });
      expect(booksRepository.create).toHaveBeenCalled();
      expect(result).toEqual({ id: 'mapped-book' });

      mapSpy.mockRestore();
    });
  });

  describe('softDelete', () => {
    it('throws NotFoundException if book not found', async () => {
      booksRepository.getById.mockResolvedValueOnce(null);
      await expect(service.softDelete('book-1')).rejects.toThrow(
        NotFoundException
      );
    });

    it('throws ConflictException if already deleted', async () => {
      booksRepository.getById.mockResolvedValueOnce(
        createMockBookEntity({ deletedAt: new Date() })
      );
      await expect(service.softDelete('book-1')).rejects.toThrow(
        ConflictException
      );
    });

    it('calls softDelete if book found and not archived', async () => {
      booksRepository.getById.mockResolvedValueOnce(createMockBookEntity());
      await service.softDelete('book-1');
      expect(booksRepository.softDelete).toHaveBeenCalledWith('book-1');
    });
  });

  describe('restore', () => {
    it('throws NotFoundException if book not found', async () => {
      booksRepository.getById.mockResolvedValueOnce(null);
      await expect(service.restore('book-1')).rejects.toThrow(
        NotFoundException
      );
    });

    it('throws ConflictException if not archived', async () => {
      booksRepository.getById.mockResolvedValueOnce(
        createMockBookEntity({ deletedAt: null })
      );
      await expect(service.restore('book-1')).rejects.toThrow(
        ConflictException
      );
    });

    it('restores a book and returns mapped response', async () => {
      booksRepository.getById.mockResolvedValueOnce(
        createMockBookEntity({ deletedAt: new Date() })
      );
      booksRepository.restore.mockResolvedValueOnce(createMockBookEntity());
      const mapSpy = jest
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        .spyOn(require('../mappers/book.mapper'), 'mapBookEntityToResponse')
        .mockReturnValue({ id: 'restored-book' });

      const result = await service.restore('book-1');
      expect(result).toEqual({ id: 'restored-book' });

      mapSpy.mockRestore();
    });
  });

  describe('delete', () => {
    it('throws NotFoundException if book not found', async () => {
      booksRepository.getById.mockResolvedValueOnce(null);
      await expect(service.delete('book-1')).rejects.toThrow(NotFoundException);
    });

    it('calls repository delete if found', async () => {
      booksRepository.getById.mockResolvedValueOnce(createMockBookEntity());
      await service.delete('book-1');
      expect(booksRepository.delete).toHaveBeenCalledWith('book-1');
    });
  });

  describe('addAuthor', () => {
    it('throws NotFound if book not found', async () => {
      booksRepository.getById.mockResolvedValueOnce(null);
      await expect(
        service.addAuthor('book-1', 'author-1', 'author')
      ).rejects.toThrow(NotFoundException);
    });

    it('adds author and returns updated mapped book', async () => {
      booksRepository.getById.mockResolvedValue(createMockBookEntity());
      const mapSpy = jest
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        .spyOn(require('../mappers/book.mapper'), 'mapBookEntityToResponse')
        .mockReturnValue({ id: 'updated-book' });

      const result = await service.addAuthor('book-1', 'author-1', 'author');
      expect(booksRepository.addAuthorToBook).toHaveBeenCalledWith(
        'book-1',
        'author-1',
        'author'
      );
      expect(result).toEqual({ id: 'updated-book' });

      mapSpy.mockRestore();
    });
  });

  describe('removeAuthor', () => {
    it('removes author and returns updated mapped book', async () => {
      booksRepository.getById.mockResolvedValue(createMockBookEntity());
      const mapSpy = jest
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        .spyOn(require('../mappers/book.mapper'), 'mapBookEntityToResponse')
        .mockReturnValue({ id: 'updated-book' });

      const result = await service.removeAuthor('book-1', 'author-1');
      expect(booksRepository.removeAuthorFromBook).toHaveBeenCalledWith(
        'book-1',
        'author-1'
      );
      expect(result).toEqual({ id: 'updated-book' });

      mapSpy.mockRestore();
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { AuthorsService } from './authors.service';
import { AuthorsRepository } from '../repositories/authors.repository';
import { NotFoundException } from '@nestjs/common';
import { createMockAuthorEntity } from '../mocks/author.mock';

jest.mock('../mappers/author.mapper', () => ({
  mapAuthorEntityToResponse: jest.fn().mockImplementation((author) => ({
    id: author.id,
    name: author.name,
    bio: author.bio ?? undefined,
  })),
}));

describe('AuthorsService', () => {
  let service: AuthorsService;
  let authorsRepository: jest.Mocked<AuthorsRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorsService,
        {
          provide: AuthorsRepository,
          useValue: {
            list: jest.fn(),
            getById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(AuthorsService);
    authorsRepository = module.get(AuthorsRepository);
  });

  describe('list', () => {
    it('returns a mapped list of authors', async () => {
      const mockAuthors = [
        createMockAuthorEntity(),
        createMockAuthorEntity({ id: 'author-2', name: 'Another Author' }),
      ];
      authorsRepository.list.mockResolvedValue(mockAuthors);

      const result = await service.list();
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('author-1');
      expect(result[1].name).toBe('Another Author');
    });
  });

  describe('getById', () => {
    it('returns a mapped author when found', async () => {
      authorsRepository.getById.mockResolvedValueOnce(createMockAuthorEntity());
      const result = await service.getById('author-1');
      expect(result).toEqual({
        id: 'author-1',
        name: 'J.R.R. Tolkien',
        bio: 'Legendary author.',
      });
    });

    it('throws NotFoundException when author not found', async () => {
      authorsRepository.getById.mockResolvedValueOnce(null);
      await expect(service.getById('author-1')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('create', () => {
    it('creates an author and returns mapped result', async () => {
      const mockAuthor = createMockAuthorEntity();
      authorsRepository.create.mockResolvedValueOnce(mockAuthor);
      const result = await service.create({
        name: 'J.R.R. Tolkien',
        bio: 'Legendary author.',
      });
      expect(result).toEqual({
        id: 'author-1',
        name: 'J.R.R. Tolkien',
        bio: 'Legendary author.',
      });
    });
  });

  describe('update', () => {
    it('updates an author and returns mapped result', async () => {
      const updatedAuthor = createMockAuthorEntity({ name: 'Updated Name' });
      authorsRepository.update.mockResolvedValueOnce(updatedAuthor);
      const result = await service.update('author-1', { name: 'Updated Name' });
      expect(result.name).toBe('Updated Name');
    });
  });

  describe('delete', () => {
    it('throws NotFoundException if author not found', async () => {
      authorsRepository.getById.mockResolvedValueOnce(null);
      await expect(service.delete('author-1')).rejects.toThrow(
        NotFoundException
      );
    });

    it('calls repository.delete if found', async () => {
      authorsRepository.getById.mockResolvedValueOnce(createMockAuthorEntity());
      await service.delete('author-1');
      expect(authorsRepository.delete).toHaveBeenCalledWith('author-1');
    });
  });
});

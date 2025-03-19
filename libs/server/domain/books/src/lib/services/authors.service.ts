import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthorsRepository } from '../repositories/authors.repository';
import { CreateAuthorDto } from '../dto/create-author.dto';
import { UpdateAuthorDto } from '../dto/update-author.dto';
import { mapAuthorEntityToResponse } from '../mappers/author.mapper';
import { Author } from '@shared/support/interfaces';

@Injectable()
export class AuthorsService {
  constructor(private readonly authorsRepository: AuthorsRepository) {}

  async list(): Promise<Author[]> {
    const authors = await this.authorsRepository.list();
    return authors.map(mapAuthorEntityToResponse);
  }

  async getById(id: string): Promise<Author> {
    const author = await this.authorsRepository.getById(id);
    if (!author) throw new NotFoundException('Author not found');
    return mapAuthorEntityToResponse(author);
  }

  async create(dto: CreateAuthorDto): Promise<Author> {
    const author = await this.authorsRepository.create(dto);
    return mapAuthorEntityToResponse(author);
  }

  async update(id: string, data: UpdateAuthorDto): Promise<Author> {
    const author = await this.authorsRepository.update(id, data);
    return mapAuthorEntityToResponse(author);
  }

  async delete(id: string): Promise<void> {
    const author = await this.authorsRepository.getById(id);
    if (!author) {
      throw new NotFoundException(`Author with ID ${id} not found.`);
    }

    await this.authorsRepository.delete(id);
  }
}

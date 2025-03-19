import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@server/support/database';
import { CreateAuthorDto } from '../dto/create-author.dto';
import { AuthorEntity } from '../entities/author.entity';
import { UpdateAuthorDto } from '../dto/update-author.dto';

@Injectable()
export class AuthorsRepository {
  constructor(public readonly db: DatabaseService) {}

  async findAll(): Promise<AuthorEntity[]> {
    return this.db.author.findMany();
  }

  async findById(id: string): Promise<AuthorEntity | null> {
    return this.db.author.findUnique({
      where: { id },
    });
  }

  async findByKey<K extends keyof AuthorEntity>(
    key: K,
    value: AuthorEntity[K]
  ): Promise<AuthorEntity | null> {
    return this.db.author.findFirst({
      where: { [key]: value },
    });
  }

  async create(dto: CreateAuthorDto): Promise<AuthorEntity> {
    return this.db.author.create({
      data: {
        name: dto.name,
        bio: dto.bio,
      },
    });
  }

  async update(id: string, dto: UpdateAuthorDto): Promise<AuthorEntity> {
    return this.db.author.update({
      where: { id },
      data: {
        name: dto.name,
        bio: dto.bio,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.db.author.delete({ where: { id } });
  }
}

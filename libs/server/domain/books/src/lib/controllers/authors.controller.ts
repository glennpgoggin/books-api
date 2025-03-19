import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Put,
} from '@nestjs/common';
import { AuthorsService } from '../services/authors.service';
import { CreateAuthorDto } from '../dto/create-author.dto';
import { UpdateAuthorDto } from '../dto/update-author.dto';
import { ApiResponse, apiResponse, Author } from '@shared/support/interfaces';

@Controller('authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Get()
  async findAll(): Promise<ApiResponse<Author[]>> {
    const authors = await this.authorsService.findAll();
    return apiResponse(authors);
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<ApiResponse<Author>> {
    const author = await this.authorsService.findById(id);
    return apiResponse(author);
  }

  @Post()
  async create(
    @Body() createAuthorDto: CreateAuthorDto
  ): Promise<ApiResponse<Author>> {
    const author = await this.authorsService.create(createAuthorDto);
    return apiResponse(author, 201, 'Author created successfully');
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAuthorDto: UpdateAuthorDto
  ): Promise<Author> {
    return this.authorsService.update(id, updateAuthorDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.authorsService.delete(id);
  }
}

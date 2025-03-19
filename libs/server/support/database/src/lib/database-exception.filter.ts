import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';
import { apiResponse } from '@shared/support/interfaces';

@Catch(Prisma.PrismaClientKnownRequestError)
export class DatabaseExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const target = exception.meta?.['target'];
    const field =
      typeof target === 'string'
        ? target.replace(/^.+?_/, '').replace(/_key$/, '')
        : Array.isArray(target)
        ? target.join(', ')
        : 'unique constraint';

    if (exception.code === 'P2002') {
      response.status(HttpStatus.CONFLICT).json(
        apiResponse(
          null,
          HttpStatus.CONFLICT,
          `A record with this ${field} already exists.`,
          undefined,
          {
            type: 'UniqueConstraintViolation',
            field,
            detail: `A record with this ${field} already exists.`,
          }
        )
      );
    } else {
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
        apiResponse(
          null,
          HttpStatus.INTERNAL_SERVER_ERROR,
          'An unexpected database error occurred.',
          undefined,
          {
            type: 'DatabaseError',
            detail: exception.message,
          }
        )
      );
    }
  }
}

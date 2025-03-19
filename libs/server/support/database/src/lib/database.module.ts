import { DatabaseExceptionFilter } from './database-exception.filter';
import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { APP_FILTER } from '@nestjs/core';

@Global()
@Module({
  providers: [
    DatabaseService,
    {
      provide: APP_FILTER,
      useClass: DatabaseExceptionFilter,
    },
  ],
  exports: [DatabaseService],
})
export class DatabaseModule {}

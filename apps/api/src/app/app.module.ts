import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';

// Domain library imports
import { BooksModule } from '@server/domain/books';

// Support library imports
import { DatabaseModule } from '@server/support/database';
import { ErrorsModule } from '@server/support/errors';

@Module({
  imports: [DatabaseModule, ErrorsModule, BooksModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

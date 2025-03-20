import { INestApplication } from '@nestjs/common';
import { BooksModule } from '@server/domain/books';
import { DatabaseModule, DatabaseService } from '@server/support/database';
import { createTestApp, ScenarioRunner } from '../support/index';
import * as path from 'path';
import { CacheModule } from '@nestjs/cache-manager';

describe('BooksController (e2e)', () => {
  let app: INestApplication;
  let db: DatabaseService;
  let runner: ScenarioRunner;

  beforeAll(async () => {
    app = await createTestApp([
      DatabaseModule,
      BooksModule,
      CacheModule.register({ isGlobal: true }),
    ]);
    db = app.get(DatabaseService);
    runner = new ScenarioRunner(app);
  });

  afterAll(async () => {
    await db.$disconnect(); // graceful shutdown
    await app.close();
  });

  beforeEach(async () => {
    console.log('Cleaning up database...');
    await db.bookAuthor.deleteMany();
    await db.book.deleteMany();
    await db.author.deleteMany();
  });

  const scenarios = [
    // Create
    './scenarios/books/create-book-success.json',
    './scenarios/books/create-book-with-author-success.json',
    './scenarios/books/create-book-failure-missing-title.json',
    './scenarios/books/create-book-failure-invalid-author-id.json',
    './scenarios/books/create-book-failure-invalid-format-enum.json',

    // Update
    './scenarios/books/update-book-success.json',
    './scenarios/books/update-book-failure-invalid-status.json',

    // Delete
    './scenarios/books/soft-delete-book-success.json',

    // Add / Remove Author
    './scenarios/books/add-author-to-book-success.json',
    './scenarios/books/remove-author-from-book-success.json',

    // List
    './scenarios/books/list-books-pagination-success.json',
  ];

  scenarios.forEach((scenarioPath) => {
    const scenarioName = scenarioPath.split('/').pop().replace('.json', '');

    it(scenarioName, async () => {
      await runner.executeFromFile(path.resolve(__dirname, scenarioPath));
    });
  });
});

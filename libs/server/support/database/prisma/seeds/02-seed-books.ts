import { PrismaClient, Author } from '@prisma/client';
import { faker } from '@faker-js/faker';
// eslint-disable-next-line @nx/enforce-module-boundaries
import {
  BookAuthorRole,
  BookFormat,
  BookGenre,
  BookStatus,
} from '../../../../../shared/support/interfaces/src';

export async function seedBooks(
  prisma: PrismaClient,
  count = 1000,
  authors: Author[]
) {
  console.log(`🌱 Seeding ${count} books...`);

  for (let i = 0; i < count; i++) {
    const book = await prisma.book.create({
      data: {
        slug:
          faker.helpers.slugify(faker.lorem.words(3)).toLowerCase() +
          `-${faker.string.nanoid(5)}`,
        title: faker.lorem.words(5),
        isbn: faker.datatype.boolean() ? faker.string.alphanumeric(13) : null,
        publishedDate: faker.date.past({ years: 50 }),
        edition: faker.helpers.maybe(
          () => `${faker.number.int({ min: 1, max: 10 })}th edition`
        ),
        format: faker.helpers.arrayElement(Object.values(BookFormat)),
        genre: faker.helpers.arrayElement(Object.values(BookGenre)),
        description: faker.lorem.words(20),
        status: faker.helpers.arrayElement(Object.values(BookStatus)),
      },
    });

    // Assign 1 to 3 authors per book
    const authorsPerBook = faker.number.int({ min: 1, max: 3 });
    const selectedAuthors = faker.helpers.arrayElements(
      authors,
      authorsPerBook
    );

    await prisma.bookAuthor.createMany({
      data: selectedAuthors.map((author) => ({
        bookId: book.id,
        authorId: author.id,
        role: faker.helpers.arrayElement(Object.values(BookAuthorRole)),
      })),
    });

    if (i % 100 === 0) {
      console.log(`➡️ Seeded ${i} books so far...`);
    }
  }

  console.log('✅ Books and author relations seeded.');
}

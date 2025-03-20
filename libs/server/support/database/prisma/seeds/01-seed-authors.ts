import { PrismaClient, Author } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedAuthors(
  prisma: PrismaClient,
  count = 100
): Promise<Author[]> {
  console.log(`🌱 Seeding ${count} authors...`);
  const authorsData = Array.from({ length: count }).map(() => ({
    name: faker.person.fullName(),
    bio: faker.lorem.words(20),
  }));

  // createMany won't return created objects, so insert + fetch
  await prisma.author.createMany({ data: authorsData });

  const authors = await prisma.author.findMany();
  console.log('✅ Authors seeded.');
  return authors;
}

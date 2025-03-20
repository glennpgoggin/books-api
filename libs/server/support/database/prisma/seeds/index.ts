import { PrismaClient } from '@prisma/client';
import { seedAuthors } from './01-seed-authors';
import { seedBooks } from './02-seed-books';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env['DATABASE_URL'],
    },
  },
});

async function main() {
  console.log('🌱 Starting database seeding...');
  const authors = await seedAuthors(prisma, 100);
  await seedBooks(prisma, 10000, authors);
  console.log('✅ Database seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

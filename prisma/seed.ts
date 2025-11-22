import { PrismaClient } from '@prisma/client';
import { gamesData } from '../lib/games-data';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing games
  await prisma.game.deleteMany();

  // Insert games
  for (const game of gamesData) {
    await prisma.game.create({
      data: game,
    });
  }

  console.log(`✅ Seeded ${gamesData.length} games`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


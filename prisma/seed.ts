import { PrismaClient } from '@prisma/client';
import { gamesData } from '../lib/games-data';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with games + settings...');

  // پاک‌کردن داده‌های قبلی با رعایت ترتیب روابط
  await prisma.gameCategory.deleteMany();
  await prisma.gameRequiredItem.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.game.deleteMany();
  await prisma.difficultyLevel.deleteMany();
  await prisma.category.deleteMany();
  await prisma.requiredItem.deleteMany();

  // 1. ایجاد سطوح دشواری پایه
  const difficultySeed = [
    { value: 'easy', nameFa: 'آسان', nameEn: 'Easy' },
    { value: 'medium', nameFa: 'متوسط', nameEn: 'Medium' },
    { value: 'hard', nameFa: 'سخت', nameEn: 'Hard' },
  ];

  await prisma.difficultyLevel.createMany({
    data: difficultySeed,
    skipDuplicates: true,
  });

  const difficultyMap = new Map<string, string>();
  const difficultyLevels = await prisma.difficultyLevel.findMany();
  for (const level of difficultyLevels) {
    difficultyMap.set(level.value, level.id);
  }

  // 2. استخراج دسته‌بندی‌ها و موارد مورد نیاز از gamesData
  const uniqueCategories = new Set<string>();
  const uniqueMaterials = new Set<string>();

  for (const game of gamesData) {
    if (game.category) {
      uniqueCategories.add(game.category.trim());
    }
    if (game.materials) {
      // مواد ممکن است شامل چند آیتم با جداکننده "،" یا "," باشد
      const parts = game.materials
        .split(/،|,/)
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      for (const part of parts) {
        uniqueMaterials.add(part);
      }
    }
  }

  // ایجاد دسته‌بندی‌ها
  const categoryMap = new Map<string, string>(); // nameFa -> id
  for (const nameFa of uniqueCategories) {
    const created = await prisma.category.create({
      data: {
        nameFa,
        nameEn: nameFa, // فعلاً همان مقدار؛ بعداً می‌توانی دستی ویرایش کنی
      },
    });
    categoryMap.set(nameFa, created.id);
  }

  // ایجاد موارد مورد نیاز
  const requiredItemMap = new Map<string, string>(); // nameFa -> id
  for (const nameFa of uniqueMaterials) {
    const created = await prisma.requiredItem.create({
      data: {
        nameFa,
        nameEn: nameFa,
      },
    });
    requiredItemMap.set(nameFa, created.id);
  }

  // 3. درج بازی‌ها + اتصال اتوماتیک به تنظیمات
  for (const game of gamesData) {
    const difficultyLevelId = difficultyMap.get(game.difficulty) || null;

    const createdGame = await prisma.game.create({
      data: {
        // فیلدهای اصلی
        id: game.id,
        name: game.name,
        nameEn: game.nameEn,
        description: game.description,
        minPlayers: game.minPlayers,
        maxPlayers: game.maxPlayers,

        // متن‌های سازگار با نسخه قبلی
        category: game.category,
        difficulty: game.difficulty,
        materials: game.materials,

        rules: game.rules,
        tips: game.tips,
        duration: game.duration,

        // FK سطح دشواری
        difficultyLevelId,
      },
    });

    // اتصال به Category (هر بازی فعلی فقط یک دسته‌بندی دارد)
    if (game.category) {
      const categoryId = categoryMap.get(game.category.trim());
      if (categoryId) {
        await prisma.gameCategory.create({
          data: {
            gameId: createdGame.id,
            categoryId,
          },
        });
      }
    }

    // اتصال به RequiredItem
    if (game.materials) {
      const parts = game.materials
        .split(/،|,/)
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      const used = new Set<string>();

      for (const part of parts) {
        const requiredItemId = requiredItemMap.get(part);
        if (requiredItemId && !used.has(requiredItemId)) {
          await prisma.gameRequiredItem.create({
            data: {
              gameId: createdGame.id,
              requiredItemId,
            },
          });
          used.add(requiredItemId);
        }
      }
    }
  }

  console.log(`✅ Seeded ${gamesData.length} games with settings`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


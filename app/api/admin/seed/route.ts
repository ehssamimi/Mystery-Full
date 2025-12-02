import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { gamesData } from '@/lib/games-data';

// POST: Seed کردن دیتابیس با بازی‌ها و تنظیمات
export async function POST() {
  try {
    console.log('🌱 Starting database seed...');

    // پاک‌کردن داده‌های قبلی با رعایت ترتیب روابط
    await prisma.gameRating.deleteMany();
    await prisma.gameCategory.deleteMany();
    await prisma.gameRequiredItem.deleteMany();
    await prisma.favorite.deleteMany();
    await prisma.game.deleteMany();
    await prisma.difficultyLevel.deleteMany();
    await prisma.category.deleteMany();
    await prisma.requiredItem.deleteMany();

    console.log('✅ Cleared existing data');

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

    console.log('✅ Created difficulty levels');

    // 2. استخراج دسته‌بندی‌ها و موارد مورد نیاز از gamesData
    const uniqueCategories = new Set<string>();
    const uniqueMaterials = new Set<string>();

    for (const game of gamesData) {
      if (game.category) {
        // دسته‌بندی‌ها را بر اساس کاما یا ویرگول فارسی جدا می‌کنیم
        const parts = game.category
          .split(/،|,/)
          .map((p) => p.trim())
          .filter((p) => p.length > 0);
        for (const part of parts) {
          uniqueCategories.add(part);
        }
      }
      if (game.materials) {
        // مواد مورد نیاز را بر اساس کاما یا ویرگول فارسی جدا می‌کنیم
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

    console.log('✅ Created categories and required items');

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
          isActive: true,

          // FK سطح دشواری
          difficultyLevelId,

          // امتیاز پیش‌فرض
          score: 5,
          ratingsCount: 1,
        },
      });

      // اتصال به Category (Many-to-Many)
      if (game.category) {
        const categoryParts = game.category
          .split(/،|,/)
          .map((c) => c.trim())
          .filter((c) => c.length > 0 && categoryMap.has(c));

        for (const categoryName of categoryParts) {
          const categoryId = categoryMap.get(categoryName);
          if (categoryId) {
            await prisma.gameCategory.create({
              data: {
                gameId: createdGame.id,
                categoryId,
              },
            });
          }
        }
      }

      // اتصال به RequiredItem (Many-to-Many)
      if (game.materials) {
        const materialParts = game.materials
          .split(/،|,/)
          .map((m) => m.trim())
          .filter((m) => m.length > 0 && requiredItemMap.has(m));

        const used = new Set<string>();

        for (const materialName of materialParts) {
          const requiredItemId = requiredItemMap.get(materialName);
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

    return NextResponse.json({
      success: true,
      message: `دیتابیس با موفقیت Seed شد. ${gamesData.length} بازی با تنظیمات اضافه شد.`,
      count: gamesData.length,
    });
  } catch (error) {
    console.error('❌ Seed error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در Seed کردن دیتابیس',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// GET: بررسی وضعیت Seed
export async function GET() {
  try {
    const gameCount = await prisma.game.count();
    const expectedCount = gamesData.length;

    return NextResponse.json({
      success: true,
      currentGames: gameCount,
      expectedGames: expectedCount,
      isSeeded: gameCount > 0,
      needsSeed: gameCount === 0 || gameCount < expectedCount,
    });
  } catch (error) {
    console.error('Get seed status error:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در بررسی وضعیت Seed' },
      { status: 500 }
    );
  }
}

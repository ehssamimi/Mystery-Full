import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Helper function برای چک کردن نقش ادمین
async function checkAdmin(request: NextRequest) {
  const token = request.cookies.get('session_token')?.value;

  if (!token) {
    return { isAdmin: false, error: 'احراز هویت نشده‌اید' };
  }

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    return { isAdmin: false, error: 'Session منقضی شده است' };
  }

  if (session.user.role !== 'admin') {
    return { isAdmin: false, error: 'دسترسی محدود' };
  }

  return { isAdmin: true };
}

// GET: لیست بازی‌ها
export async function GET(request: NextRequest) {
  try {
    const adminCheck = await checkAdmin(request);

    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { success: false, error: adminCheck.error },
        { status: 403 }
      );
    }

    const games = await prisma.game.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      games,
    });
  } catch (error) {
    console.error('Get games error:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در دریافت لیست بازی‌ها' },
      { status: 500 }
    );
  }
}

// PUT: ویرایش بازی
export async function PUT(request: NextRequest) {
  try {
    const adminCheck = await checkAdmin(request);

    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { success: false, error: adminCheck.error },
        { status: 403 }
      );
    }

    const body = await request.json();
    console.log('Update request body:', body);

    const updateSchema = z.object({
      id: z.string(),
      name: z.string().optional(),
      nameEn: z.string().optional(),
      description: z.string().optional(),
      minPlayers: z.number().int().positive().optional(),
      maxPlayers: z.number().int().positive().optional(),
      category: z.string().optional(),
      rules: z.string().optional(),
      tips: z.string().optional(),
      difficultyLevelId: z.string().optional(),
      duration: z.number().int().positive().optional(),
      materials: z.string().optional(),
      isActive: z.boolean().optional(),
      categoryIds: z.array(z.string()).optional(),
      requiredItemIds: z.array(z.string()).optional(),
    });

    const data = updateSchema.parse(body);
    const { id, categoryIds, requiredItemIds, difficultyLevelId, ...updateData } = data;

    console.log('Update data:', { id, updateData });

    // بررسی اینکه آیا حداقل یک فیلد برای به‌روزرسانی وجود دارد
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'هیچ فیلدی برای به‌روزرسانی ارسال نشده است' },
        { status: 400 }
      );
    }

    // بررسی وجود بازی قبل از به‌روزرسانی
    const existingGame = await prisma.game.findUnique({
      where: { id },
      include: {
        categories: true,
        requiredItems: true,
        difficultyLevel: true,
      },
    });

    if (!existingGame) {
      return NextResponse.json(
        { success: false, error: 'بازی یافت نشد' },
        { status: 404 }
      );
    }

    // اگر difficultyLevelId جدید ارسال شده، مقدار متنی difficulty را هم sync کن
    if (difficultyLevelId) {
      const level = await prisma.difficultyLevel.findUnique({
        where: { id: difficultyLevelId },
      });
      if (level) {
        (updateData as any).difficultyLevelId = level.id;
        (updateData as any).difficulty = level.value;
      }
    }

    // اگر categoryIds ارسال شده، رشته category (نمایش سریع) را هم از روی تنظیمات دسته‌بندی sync کن
    if (categoryIds && categoryIds.length > 0) {
      const categories = await prisma.category.findMany({
        where: { id: { in: categoryIds } },
        orderBy: { createdAt: 'asc' },
      });

      if (categories.length > 0) {
        // نمایش: نام فارسی تمام دسته‌بندی‌ها به صورت یک رشته
        (updateData as any).category = categories.map((c) => c.nameFa).join('، ');
      }
    }

    // اگر requiredItemIds ارسال شده، رشته materials را هم sync کن تا در جاهای قدیمی درست نمایش داده شود
    if (requiredItemIds && requiredItemIds.length > 0) {
      const items = await prisma.requiredItem.findMany({
        where: { id: { in: requiredItemIds } },
        orderBy: { createdAt: 'asc' },
      });

      if (items.length > 0) {
        (updateData as any).materials = items.map((i) => i.nameFa).join('، ');
      }
    }

    const game = await prisma.game.update({
      where: { id },
      data: updateData,
    });

    // به‌روزرسانی دسته‌بندی‌ها (many-to-many)
    if (categoryIds) {
      await prisma.gameCategory.deleteMany({ where: { gameId: id } });
      await prisma.gameCategory.createMany({
        data: categoryIds.map((categoryId) => ({
          gameId: id,
          categoryId,
        })),
        skipDuplicates: true,
      });
    }

    // به‌روزرسانی موارد مورد نیاز (many-to-many)
    if (requiredItemIds) {
      await prisma.gameRequiredItem.deleteMany({ where: { gameId: id } });
      await prisma.gameRequiredItem.createMany({
        data: requiredItemIds.map((requiredItemId) => ({
          gameId: id,
          requiredItemId,
        })),
        skipDuplicates: true,
      });
    }

    return NextResponse.json({
      success: true,
      game,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors);
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    // Log the full error for debugging
    console.error('Update game error:', error);
    const errorMessage = error instanceof Error ? error.message : 'خطا در ویرایش بازی';
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'خطا در ویرایش بازی',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

// POST: ایجاد بازی جدید
export async function POST(request: NextRequest) {
  try {
    const adminCheck = await checkAdmin(request);

    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { success: false, error: adminCheck.error },
        { status: 403 }
      );
    }

    const body = await request.json();
    const createSchema = z.object({
      name: z.string().min(1),
      nameEn: z.string().min(1),
      description: z.string().min(1),
      minPlayers: z.number().int().positive(),
      maxPlayers: z.number().int().positive(),
      // در نسخه جدید، category به صورت خودکار از روی categoryIds پر می‌شود
      category: z.string().min(1).optional(),
      rules: z.string().min(1),
      tips: z.string().optional(),
      difficultyLevelId: z.string().optional(),
      duration: z.number().int().positive(),
      materials: z.string().optional(),
      categoryIds: z.array(z.string()).optional(),
      requiredItemIds: z.array(z.string()).optional(),
    });

    const data = createSchema.parse(body);

    // مقدار difficulty متنی بر اساس difficultyLevelId
    let difficultyValue: 'easy' | 'medium' | 'hard' = 'medium';
    if (data.difficultyLevelId) {
      const level = await prisma.difficultyLevel.findUnique({
        where: { id: data.difficultyLevelId },
      });
      if (level && (level.value === 'easy' || level.value === 'medium' || level.value === 'hard')) {
        difficultyValue = level.value;
      }
    }

    // اگر category خالی است، آن را از روی categoryIds و جدول Category پر کن
    let displayCategory = data.category ?? '';
    let materialsText = data.materials ?? '';

    if ((!displayCategory || displayCategory.trim().length === 0) && data.categoryIds && data.categoryIds.length > 0) {
      const categories = await prisma.category.findMany({
        where: { id: { in: data.categoryIds } },
        orderBy: { createdAt: 'asc' },
      });
      if (categories.length > 0) {
        displayCategory = categories.map((c) => c.nameFa).join('، ');
      }
    }

    // اگر materials خالی است ولی requiredItemIds داریم، رشته متنی را از روی RequiredItem ها بساز
    if ((!materialsText || materialsText.trim().length === 0) && data.requiredItemIds && data.requiredItemIds.length > 0) {
      const items = await prisma.requiredItem.findMany({
        where: { id: { in: data.requiredItemIds } },
        orderBy: { createdAt: 'asc' },
      });
      if (items.length > 0) {
        materialsText = items.map((i) => i.nameFa).join('، ');
      }
    }

    const game = await prisma.game.create({
      data: {
        name: data.name,
        nameEn: data.nameEn,
        description: data.description,
        minPlayers: data.minPlayers,
        maxPlayers: data.maxPlayers,
        category: displayCategory || 'بدون دسته‌بندی',
        rules: data.rules,
        tips: data.tips,
        difficulty: difficultyValue,
        duration: data.duration,
        materials: materialsText || null,
        difficultyLevelId: data.difficultyLevelId,
      },
    });

    // ایجاد ارتباط دسته‌بندی‌ها
    if (data.categoryIds && data.categoryIds.length > 0) {
      await prisma.gameCategory.createMany({
        data: data.categoryIds.map((categoryId) => ({
          gameId: game.id,
          categoryId,
        })),
        skipDuplicates: true,
      });
    }

    // ایجاد ارتباط موارد مورد نیاز
    if (data.requiredItemIds && data.requiredItemIds.length > 0) {
      await prisma.gameRequiredItem.createMany({
        data: data.requiredItemIds.map((requiredItemId) => ({
          gameId: game.id,
          requiredItemId,
        })),
        skipDuplicates: true,
      });
    }

    return NextResponse.json({
      success: true,
      game,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Create game error:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در ایجاد بازی' },
      { status: 500 }
    );
  }
}

// DELETE: حذف بازی
export async function DELETE(request: NextRequest) {
  try {
    const adminCheck = await checkAdmin(request);

    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { success: false, error: adminCheck.error },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'شناسه بازی ارسال نشده است' },
        { status: 400 }
      );
    }

    await prisma.game.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'بازی با موفقیت حذف شد',
    });
  } catch (error) {
    console.error('Delete game error:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در حذف بازی' },
      { status: 500 }
    );
  }
}


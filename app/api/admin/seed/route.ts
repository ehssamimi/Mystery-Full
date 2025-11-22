import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { gamesData } from '@/lib/games-data';

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

// POST: Seed کردن دیتابیس با بازی‌ها
export async function POST(request: NextRequest) {
  try {
    // بررسی دسترسی: یا Admin باشد یا Secret Token داشته باشد
    const authHeader = request.headers.get('authorization');
    const secretToken = process.env.SEED_SECRET;
    
    let hasAccess = false;

    // روش ۱: بررسی Secret Token
    if (secretToken && authHeader === `Bearer ${secretToken}`) {
      hasAccess = true;
    }

    // روش ۲: بررسی Admin Session
    if (!hasAccess) {
      const adminCheck = await checkAdmin(request);
      hasAccess = adminCheck.isAdmin;
    }

    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: 'دسترسی محدود' },
        { status: 403 }
      );
    }

    console.log('🌱 Starting database seed...');

    // پاک کردن بازی‌های موجود
    await prisma.game.deleteMany();
    console.log('✅ Cleared existing games');

    // اضافه کردن بازی‌های جدید
    let seededCount = 0;
    for (const game of gamesData) {
      await prisma.game.create({
        data: game,
      });
      seededCount++;
    }

    console.log(`✅ Seeded ${seededCount} games successfully`);

    return NextResponse.json({
      success: true,
      message: `دیتابیس با موفقیت Seed شد. ${seededCount} بازی اضافه شد.`,
      count: seededCount,
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

// GET: بررسی وضعیت Seed (تعداد بازی‌ها)
export async function GET(request: NextRequest) {
  try {
    const adminCheck = await checkAdmin(request);

    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { success: false, error: adminCheck.error },
        { status: 403 }
      );
    }

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


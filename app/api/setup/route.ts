import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { gamesData } from '@/lib/games-data';

// API موقت برای Setup اولیه - فقط یک بار استفاده شود
// بعد از Setup، این فایل را حذف کنید یا Authentication اضافه کنید

export async function POST(request: NextRequest) {
  try {
    // بررسی Secret Token (اختیاری - برای امنیت بیشتر)
    const authHeader = request.headers.get('authorization');
    const setupSecret = process.env.SETUP_SECRET || 'setup-temp-secret-12345';
    
    if (authHeader !== `Bearer ${setupSecret}`) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'دسترسی محدود. از Authorization Header استفاده کنید: Bearer setup-temp-secret-12345' 
        },
        { status: 403 }
      );
    }

    console.log('🚀 Starting setup...');

    // 1. Seed کردن بازی‌ها
    console.log('🌱 Seeding games...');
    await prisma.game.deleteMany();
    let seededCount = 0;
    for (const game of gamesData) {
      await prisma.game.create({
        data: game,
      });
      seededCount++;
    }
    console.log(`✅ Seeded ${seededCount} games`);

    // 2. ایجاد/به‌روزرسانی کاربر Admin
    console.log('👤 Creating admin user...');
    const adminPhone = '09112561701';
    let adminUser = await prisma.user.findUnique({
      where: { phone: adminPhone },
    });

    if (adminUser) {
      adminUser = await prisma.user.update({
        where: { phone: adminPhone },
        data: { role: 'admin' },
      });
      console.log(`✅ Admin user ${adminPhone} updated`);
    } else {
      adminUser = await prisma.user.create({
        data: {
          phone: adminPhone,
          role: 'admin',
        },
      });
      console.log(`✅ Admin user ${adminPhone} created`);
    }

    return NextResponse.json({
      success: true,
      message: 'Setup با موفقیت انجام شد!',
      games: seededCount,
      admin: {
        phone: adminUser.phone,
        role: adminUser.role,
        id: adminUser.id,
      },
      warning: '⚠️ این API را بعد از Setup حذف کنید یا Authentication اضافه کنید!',
    });
  } catch (error) {
    console.error('❌ Setup error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در Setup',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// GET: بررسی وضعیت Setup
export async function GET(request: NextRequest) {
  try {
    const gameCount = await prisma.game.count();
    const adminCount = await prisma.user.count({
      where: { role: 'admin' },
    });
    const userCount = await prisma.user.count();

    return NextResponse.json({
      success: true,
      games: gameCount,
      admins: adminCount,
      users: userCount,
      isSetup: gameCount > 0 && adminCount > 0,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در بررسی وضعیت',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}


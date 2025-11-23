import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper function برای گرفتن کاربر از session
async function getCurrentUser(request: NextRequest) {
  const token = request.cookies.get('session_token')?.value;

  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  return session.user;
}

// GET: دریافت لیست favorites کاربر
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'احراز هویت نشده‌اید' },
        { status: 401 }
      );
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: user.id },
      include: {
        game: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      favorites: favorites.map((f) => ({
        id: f.id,
        gameId: f.gameId,
        game: f.game,
        createdAt: f.createdAt,
      })),
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در دریافت favorites' },
      { status: 500 }
    );
  }
}

// POST: اضافه کردن به favorites
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'احراز هویت نشده‌اید' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { gameId } = body;

    if (!gameId) {
      return NextResponse.json(
        { success: false, error: 'شناسه بازی ارسال نشده است' },
        { status: 400 }
      );
    }

    // بررسی وجود بازی
    const game = await prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      return NextResponse.json(
        { success: false, error: 'بازی یافت نشد' },
        { status: 404 }
      );
    }

    // بررسی وجود favorite (برای جلوگیری از duplicate)
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_gameId: {
          userId: user.id,
          gameId: gameId,
        },
      },
    });

    if (existingFavorite) {
      return NextResponse.json({
        success: true,
        message: 'این بازی قبلاً به favorites اضافه شده است',
        favorite: existingFavorite,
      });
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId: user.id,
        gameId: gameId,
      },
      include: {
        game: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'بازی به favorites اضافه شد',
      favorite: {
        id: favorite.id,
        gameId: favorite.gameId,
        game: favorite.game,
        createdAt: favorite.createdAt,
      },
    });
  } catch (error) {
    console.error('Add favorite error:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در اضافه کردن به favorites' },
      { status: 500 }
    );
  }
}

// DELETE: حذف از favorites
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'احراز هویت نشده‌اید' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId');

    if (!gameId) {
      return NextResponse.json(
        { success: false, error: 'شناسه بازی ارسال نشده است' },
        { status: 400 }
      );
    }

    await prisma.favorite.deleteMany({
      where: {
        userId: user.id,
        gameId: gameId,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'بازی از favorites حذف شد',
    });
  } catch (error) {
    console.error('Remove favorite error:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در حذف از favorites' },
      { status: 500 }
    );
  }
}


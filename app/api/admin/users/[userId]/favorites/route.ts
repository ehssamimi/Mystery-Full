import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

// GET: دریافت favorites یک کاربر
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const adminCheck = await checkAdmin(request);

    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { success: false, error: adminCheck.error },
        { status: 403 }
      );
    }

    const { userId } = params;

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        game: {
          select: {
            id: true,
            name: true,
            nameEn: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      favoritesCount: favorites.length,
      favoriteGames: favorites.map((f) => ({
        id: f.game.id,
        name: f.game.name,
        nameEn: f.game.nameEn,
      })),
    });
  } catch (error) {
    console.error('Get user favorites error:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در دریافت favorites کاربر' },
      { status: 500 }
    );
  }
}


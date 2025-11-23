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

  return { isAdmin: true, user: session.user };
}

// GET: لیست کاربران
export async function GET(request: NextRequest) {
  try {
    const adminCheck = await checkAdmin(request);

    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { success: false, error: adminCheck.error },
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // دریافت favorites برای هر کاربر
    const usersWithFavorites = await Promise.all(
      users.map(async (user) => {
        const favoritesCount = await prisma.favorite.count({
          where: { userId: user.id },
        });

        const favorites = await prisma.favorite.findMany({
          where: { userId: user.id },
          include: {
            game: {
              select: {
                id: true,
                name: true,
                nameEn: true,
              },
            },
          },
          take: 5, // فقط 5 تا اول
          orderBy: {
            createdAt: 'desc',
          },
        });

        return {
          id: user.id,
          phone: user.phone,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          favoritesCount,
          favoriteGames: favorites.map((f) => ({
            id: f.game.id,
            name: f.game.name,
            nameEn: f.game.nameEn,
          })),
        };
      })
    );

    return NextResponse.json({
      success: true,
      users: usersWithFavorites,
    });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در دریافت لیست کاربران' },
      { status: 500 }
    );
  }
}

// PUT: تغییر نقش کاربر
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
    const updateSchema = z.object({
      userId: z.string(),
      role: z.enum(['user', 'admin']),
    });

    const { userId, role } = updateSchema.parse(body);

    // نمی‌توانیم نقش خودمان را تغییر دهیم
    if (userId === adminCheck.user?.id) {
      return NextResponse.json(
        { success: false, error: 'نمی‌توانید نقش خود را تغییر دهید' },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        phone: true,
        role: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Update user role error:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در تغییر نقش کاربر' },
      { status: 500 }
    );
  }
}


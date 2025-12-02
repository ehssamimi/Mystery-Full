import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// گرفتن کاربر از session_token
async function getUserId(request: NextRequest) {
  const token = request.cookies.get('session_token')?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) return null;
  return session.user.id;
}

// GET: گرفتن امتیاز کاربر + میانگین بازی
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const gameId = params.id;
    const userId = await getUserId(request);

    const game = await prisma.game.findUnique({
      where: { id: gameId },
      select: {
        id: true,
        score: true,
        ratingsCount: true,
      },
    });

    if (!game) {
      return NextResponse.json(
        { success: false, error: 'بازی یافت نشد' },
        { status: 404 }
      );
    }

    let userRating: number | null = null;
    if (userId) {
      const rating = await prisma.gameRating.findUnique({
        where: {
          gameId_userId: {
            gameId,
            userId,
          },
        },
      });
      if (rating) userRating = rating.score;
    }

    return NextResponse.json({
      success: true,
      game: {
        id: game.id,
        score: game.score,
        ratingsCount: game.ratingsCount,
      },
      userRating,
    });
  } catch (error) {
    console.error('Get rating error:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در دریافت امتیاز بازی' },
      { status: 500 }
    );
  }
}

// POST: ثبت/ویرایش امتیاز کاربر برای بازی
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const gameId = params.id;
    const userId = await getUserId(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'برای امتیازدهی باید وارد شوید' },
        { status: 401 }
      );
    }

    const body = await request.json();
    let score = Number(body.score);

    if (!Number.isFinite(score)) {
      return NextResponse.json(
        { success: false, error: 'امتیاز نامعتبر است' },
        { status: 400 }
      );
    }

    // محدود کردن بین 1 و 5
    if (score < 1) score = 1;
    if (score > 5) score = 5;

    // مطمئن شو بازی وجود دارد
    const existingGame = await prisma.game.findUnique({
      where: { id: gameId },
      select: { id: true },
    });

    if (!existingGame) {
      return NextResponse.json(
        { success: false, error: 'بازی یافت نشد' },
        { status: 404 }
      );
    }

    // upsert رأی کاربر
    await prisma.gameRating.upsert({
      where: {
        gameId_userId: {
          gameId,
          userId,
        },
      },
      update: {
        score,
      },
      create: {
        gameId,
        userId,
        score,
      },
    });

    // محاسبه مجدد میانگین و تعداد رأی‌ها
    // رای پیش‌فرض ۵ با تعداد ۱ همیشه در نظر گرفته می‌شود
    const aggregate = await prisma.gameRating.aggregate({
      where: { gameId },
      _avg: { score: true },
      _count: { _all: true },
    });

    const baseScore = 5;
    const baseCount = 1;
    const userCount = aggregate._count._all ?? 0;
    const userAvg = aggregate._avg.score ?? 0;

    const totalCount = baseCount + userCount;
    const totalScoreSum = baseScore * baseCount + userAvg * userCount;
    const avgScore = totalCount > 0 ? totalScoreSum / totalCount : baseScore;

    const updatedGame = await prisma.game.update({
      where: { id: gameId },
      data: {
        score: avgScore,
        ratingsCount: totalCount,
      },
      select: {
        id: true,
        score: true,
        ratingsCount: true,
      },
    });

    return NextResponse.json({
      success: true,
      game: updatedGame,
      userRating: score,
    });
  } catch (error) {
    console.error('Save rating error:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در ثبت امتیاز بازی' },
      { status: 500 }
    );
  }
}



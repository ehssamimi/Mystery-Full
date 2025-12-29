import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const gameId = params.id;

    if (!gameId) {
      return NextResponse.json(
        { success: false, error: 'شناسه بازی ارسال نشده است' },
        { status: 400 }
      );
    }

    // بررسی وجود بازی
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        datasets: {
          include: {
            dataset: {
              include: {
                items: true,
              },
            },
          },
        },
      },
    });

    if (!game) {
      return NextResponse.json(
        { success: false, error: 'بازی یافت نشد' },
        { status: 404 }
      );
    }

    // ساختاردهی داده‌ها برای response
    const datasets = game.datasets.map((gameDataset) => ({
      id: gameDataset.dataset.id,
      nameFa: gameDataset.dataset.nameFa,
      nameEn: gameDataset.dataset.nameEn,
      items: gameDataset.dataset.items.map((item) => ({
        id: item.id,
        nameFa: item.nameFa,
        nameEn: item.nameEn,
      })),
    }));

    return NextResponse.json({
      success: true,
      datasets,
    });
  } catch (error) {
    console.error('Get game datasets error:', error);
    const errorMessage = error instanceof Error ? error.message : 'خطا در دریافت datasets';
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در دریافت datasets',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}


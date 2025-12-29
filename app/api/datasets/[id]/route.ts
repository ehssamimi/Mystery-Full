import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/datasets/[id]
 * دریافت اطلاعات کامل یک dataset با استفاده از ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const datasetId = params.id;

    if (!datasetId) {
      return NextResponse.json(
        { success: false, error: 'شناسه Dataset ارسال نشده است' },
        { status: 400 }
      );
    }

    // دریافت dataset با تمام آیتم‌هایش
    const dataset = await prisma.dataset.findUnique({
      where: { id: datasetId },
      include: {
        items: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!dataset) {
      return NextResponse.json(
        { success: false, error: 'Dataset یافت نشد' },
        { status: 404 }
      );
    }

    // ساختاردهی response
    const response = {
      success: true,
      dataset: {
        id: dataset.id,
        nameFa: dataset.nameFa,
        nameEn: dataset.nameEn,
        items: dataset.items.map((item) => ({
          id: item.id,
          nameFa: item.nameFa,
          nameEn: item.nameEn,
        })),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Get dataset error:', error);
    const errorMessage = error instanceof Error ? error.message : 'خطا در دریافت Dataset';
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در دریافت Dataset',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}


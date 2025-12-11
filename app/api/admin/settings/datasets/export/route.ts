import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

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

// GET: Export لیست Dataset‌ها به Excel
export async function GET(request: NextRequest) {
  try {
    const adminCheck = await checkAdmin(request);

    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { success: false, error: adminCheck.error },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';

    const where =
      search.length > 0
        ? {
            OR: [
              { nameFa: { contains: search, mode: 'insensitive' as const } },
              { nameEn: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : undefined;

    const datasets = await prisma.dataset.findMany({
      where,
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        _count: {
          select: { items: true },
        },
      },
    });

    // تبدیل داده‌ها به فرمت ساده برای Excel
    const rows = datasets.map((d) => ({
      id: d.id,
      nameFa: d.nameFa,
      nameEn: d.nameEn,
      itemsCount: d._count.items,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Datasets');

    const buffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    });

    const filename = `datasets-export-${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;

    return new NextResponse(Buffer.from(buffer), {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Export datasets error:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در Export لیست Dataset‌ها' },
      { status: 500 }
    );
  }
}


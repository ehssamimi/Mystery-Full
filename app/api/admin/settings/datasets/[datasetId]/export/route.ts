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

// GET: Export لیست DatasetItem‌ها به Excel
export async function GET(
  request: NextRequest,
  { params }: { params: { datasetId: string } }
) {
  try {
    const adminCheck = await checkAdmin(request);

    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { success: false, error: adminCheck.error },
        { status: 403 }
      );
    }

    const { datasetId } = params;

    // Verify dataset exists
    const dataset = await prisma.dataset.findUnique({
      where: { id: datasetId },
    });

    if (!dataset) {
      return NextResponse.json(
        { success: false, error: 'Dataset یافت نشد' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';

    const where: any = { datasetId };

    if (search.length > 0) {
      where.OR = [
        { nameFa: { contains: search, mode: 'insensitive' as const } },
        { nameEn: { contains: search, mode: 'insensitive' as const } },
      ];
    }

    const items = await prisma.datasetItem.findMany({
      where,
      orderBy: {
        createdAt: 'asc',
      },
    });

    // تبدیل داده‌ها به فرمت ساده برای Excel
    const rows = items.map((item) => ({
      id: item.id,
      nameFa: item.nameFa,
      nameEn: item.nameEn,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DatasetItems');

    const buffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    });

    const filename = `dataset-items-${datasetId}-export-${new Date()
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
    console.error('Export dataset items error:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در Export لیست آیتم‌های Dataset' },
      { status: 500 }
    );
  }
}


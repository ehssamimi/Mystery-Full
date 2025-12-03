import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

// Helper function برای چک کردن نقش ادمین (کپی از /api/admin/games)
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

// GET: Export لیست بازی‌ها به Excel
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
              { name: { contains: search, mode: 'insensitive' as const } },
              { nameEn: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : undefined;

    const games = await prisma.game.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // تبدیل داده‌ها به فرمت ساده برای Excel
    const rows = games.map((g) => ({
      id: g.id,
      name: g.name,
      nameEn: g.nameEn,
      description: g.description,
      minPlayers: g.minPlayers,
      maxPlayers: g.maxPlayers,
      category: g.category,
      difficulty: g.difficulty,
      materials: g.materials ?? '',
      rules: g.rules,
      tips: g.tips ?? '',
      duration: g.duration,
      isActive: g.isActive,
      score: g.score,
      ratingsCount: g.ratingsCount,
      createdAt: g.createdAt,
      updatedAt: g.updatedAt,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Games');

    const buffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    });

    const filename = `games-export-${new Date()
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
    console.error('Export games error:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در Export لیست بازی‌ها' },
      { status: 500 }
    );
  }
}



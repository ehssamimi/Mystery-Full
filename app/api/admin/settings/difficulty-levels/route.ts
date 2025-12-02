import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// همان الگوی checkAdmin در /api/admin/games
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

// لیست سطوح دشواری
export async function GET(request: NextRequest) {
  try {
    const adminCheck = await checkAdmin(request);

    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { success: false, error: adminCheck.error },
        { status: 403 }
      );
    }

    const items = await prisma.difficultyLevel.findMany({
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error('Get difficulty levels error:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در دریافت سطوح دشواری' },
      { status: 500 }
    );
  }
}

// ایجاد سطح دشواری جدید
export async function POST(request: NextRequest) {
  try {
    const adminCheck = await checkAdmin(request);

    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { success: false, error: adminCheck.error },
        { status: 403 }
      );
    }

    const body = await request.json();

    const schema = z.object({
      nameFa: z.string().min(1),
      nameEn: z.string().min(1),
      value: z.string().min(1),
    });

    const data = schema.parse(body);

    const item = await prisma.difficultyLevel.create({
      data,
    });

    return NextResponse.json({ success: true, item });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0]?.message },
        { status: 400 }
      );
    }

    console.error('Create difficulty level error:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در ایجاد سطح دشواری' },
      { status: 500 }
    );
  }
}

// ویرایش سطح دشواری
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

    const schema = z.object({
      id: z.string(),
      nameFa: z.string().min(1).optional(),
      nameEn: z.string().min(1).optional(),
      value: z.string().min(1).optional(),
    });

    const data = schema.parse(body);
    const { id, ...updateData } = data;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'هیچ فیلدی برای به‌روزرسانی ارسال نشده است' },
        { status: 400 }
      );
    }

    const existing = await prisma.difficultyLevel.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'سطح دشواری یافت نشد' },
        { status: 404 }
      );
    }

    const item = await prisma.difficultyLevel.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, item });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0]?.message },
        { status: 400 }
      );
    }

    console.error('Update difficulty level error:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در ویرایش سطح دشواری' },
      { status: 500 }
    );
  }
}

// حذف سطح دشواری
export async function DELETE(request: NextRequest) {
  try {
    const adminCheck = await checkAdmin(request);

    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { success: false, error: adminCheck.error },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'شناسه ارسال نشده است' },
        { status: 400 }
      );
    }

    await prisma.difficultyLevel.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'سطح دشواری با موفقیت حذف شد',
    });
  } catch (error) {
    console.error('Delete difficulty level error:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در حذف سطح دشواری' },
      { status: 500 }
    );
  }
}



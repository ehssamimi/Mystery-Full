import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

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

export async function GET(request: NextRequest) {
  try {
    const adminCheck = await checkAdmin(request);

    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { success: false, error: adminCheck.error },
        { status: 403 }
      );
    }

    const datasets = await prisma.dataset.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        _count: {
          select: { items: true },
        },
      },
    });

    // Map to include itemsCount
    const items = datasets.map((dataset) => ({
      id: dataset.id,
      nameFa: dataset.nameFa,
      nameEn: dataset.nameEn,
      createdAt: dataset.createdAt,
      updatedAt: dataset.updatedAt,
      itemsCount: dataset._count?.items || 0,
    }));

    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error('Get datasets error:', error);
    const errorMessage = error instanceof Error ? error.message : 'خطا در دریافت Dataset‌ها';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

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
    });

    const data = schema.parse(body);

    const item = await prisma.dataset.create({
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

    console.error('Create dataset error:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در ایجاد Dataset' },
      { status: 500 }
    );
  }
}

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
    });

    const data = schema.parse(body);
    const { id, ...updateData } = data;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'هیچ فیلدی برای به‌روزرسانی ارسال نشده است' },
        { status: 400 }
      );
    }

    const existing = await prisma.dataset.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Dataset یافت نشد' },
        { status: 404 }
      );
    }

    const item = await prisma.dataset.update({
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

    console.error('Update dataset error:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در ویرایش Dataset' },
      { status: 500 }
    );
  }
}

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

    // Cascade delete is handled by Prisma relation
    await prisma.dataset.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Dataset با موفقیت حذف شد',
    });
  } catch (error) {
    console.error('Delete dataset error:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در حذف Dataset' },
      { status: 500 }
    );
  }
}


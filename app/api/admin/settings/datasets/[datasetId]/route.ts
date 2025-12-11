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

    const items = await prisma.datasetItem.findMany({
      where: { datasetId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ 
      success: true, 
      items,
      dataset: {
        id: dataset.id,
        nameFa: dataset.nameFa,
        nameEn: dataset.nameEn,
      },
    });
  } catch (error) {
    console.error('Get dataset items error:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در دریافت آیتم‌های Dataset' },
      { status: 500 }
    );
  }
}

export async function POST(
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

    const body = await request.json();

    const schema = z.object({
      nameFa: z.string().min(1),
      nameEn: z.string().min(1),
    });

    const data = schema.parse(body);

    const item = await prisma.datasetItem.create({
      data: {
        ...data,
        datasetId,
      },
    });

    return NextResponse.json({ success: true, item });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0]?.message },
        { status: 400 }
      );
    }

    console.error('Create dataset item error:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در ایجاد آیتم Dataset' },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    // Verify item exists and belongs to this dataset
    const existing = await prisma.datasetItem.findFirst({
      where: { id, datasetId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'آیتم Dataset یافت نشد' },
        { status: 404 }
      );
    }

    const item = await prisma.datasetItem.update({
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

    console.error('Update dataset item error:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در ویرایش آیتم Dataset' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'شناسه ارسال نشده است' },
        { status: 400 }
      );
    }

    // Verify item exists and belongs to this dataset
    const existing = await prisma.datasetItem.findFirst({
      where: { id, datasetId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'آیتم Dataset یافت نشد' },
        { status: 404 }
      );
    }

    await prisma.datasetItem.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'آیتم Dataset با موفقیت حذف شد',
    });
  } catch (error) {
    console.error('Delete dataset item error:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در حذف آیتم Dataset' },
      { status: 500 }
    );
  }
}


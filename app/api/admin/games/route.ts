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

  return { isAdmin: true };
}

// GET: لیست بازی‌ها
export async function GET(request: NextRequest) {
  try {
    const adminCheck = await checkAdmin(request);

    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { success: false, error: adminCheck.error },
        { status: 403 }
      );
    }

    const games = await prisma.game.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      games,
    });
  } catch (error) {
    console.error('Get games error:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در دریافت لیست بازی‌ها' },
      { status: 500 }
    );
  }
}

// PUT: ویرایش بازی
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
    console.log('Update request body:', body);
    
    const updateSchema = z.object({
      id: z.string(),
      name: z.string().optional(),
      nameEn: z.string().optional(),
      description: z.string().optional(),
      minPlayers: z.number().int().positive().optional(),
      maxPlayers: z.number().int().positive().optional(),
      category: z.string().optional(),
      rules: z.string().optional(),
      tips: z.string().optional(),
      difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
      duration: z.number().int().positive().optional(),
      materials: z.string().optional(),
      isActive: z.boolean().optional(),
    });

    const data = updateSchema.parse(body);
    const { id, ...updateData } = data;
    
    console.log('Update data:', { id, updateData });

    // بررسی اینکه آیا حداقل یک فیلد برای به‌روزرسانی وجود دارد
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'هیچ فیلدی برای به‌روزرسانی ارسال نشده است' },
        { status: 400 }
      );
    }

    // بررسی وجود بازی قبل از به‌روزرسانی
    const existingGame = await prisma.game.findUnique({
      where: { id },
    });

    if (!existingGame) {
      return NextResponse.json(
        { success: false, error: 'بازی یافت نشد' },
        { status: 404 }
      );
    }

    const game = await prisma.game.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      game,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors);
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    // Log the full error for debugging
    console.error('Update game error:', error);
    const errorMessage = error instanceof Error ? error.message : 'خطا در ویرایش بازی';
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'خطا در ویرایش بازی',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

// POST: ایجاد بازی جدید
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
    const createSchema = z.object({
      name: z.string().min(1),
      nameEn: z.string().min(1),
      description: z.string().min(1),
      minPlayers: z.number().int().positive(),
      maxPlayers: z.number().int().positive(),
      category: z.string().min(1),
      rules: z.string().min(1),
      tips: z.string().optional(),
      difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
      duration: z.number().int().positive(),
      materials: z.string().optional(),
    });

    const data = createSchema.parse(body);

    const game = await prisma.game.create({
      data,
    });

    return NextResponse.json({
      success: true,
      game,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Create game error:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در ایجاد بازی' },
      { status: 500 }
    );
  }
}

// DELETE: حذف بازی
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
        { success: false, error: 'شناسه بازی ارسال نشده است' },
        { status: 400 }
      );
    }

    await prisma.game.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'بازی با موفقیت حذف شد',
    });
  } catch (error) {
    console.error('Delete game error:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در حذف بازی' },
      { status: 500 }
    );
  }
}


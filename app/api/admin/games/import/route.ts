import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

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

const importSchema = z.object({
  rows: z.array(z.record(z.any())),
});

// POST: Import بازی‌ها از Excel (JSON تبدیل‌شده در کلاینت) با upsert بر اساس id
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
    const { rows } = importSchema.parse(body);

    let created = 0;
    let updated = 0;
    const errors: { rowIndex: number; message: string }[] = [];

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];

      try {
        const rawId = row.id;
        if (!rawId) {
          errors.push({ rowIndex: index + 2, message: 'id خالی است' });
          continue;
        }

        const id = String(rawId).trim();
        if (!id) {
          errors.push({ rowIndex: index + 2, message: 'id نامعتبر است' });
          continue;
        }

        // ساخت data برای Prisma با توجه به فیلدهای موجود
        const data: any = {};

        if (row.name !== undefined) data.name = String(row.name);
        if (row.nameEn !== undefined) data.nameEn = String(row.nameEn);
        if (row.description !== undefined)
          data.description = String(row.description);

        if (row.minPlayers !== undefined) {
          const v = Number(row.minPlayers);
          if (!Number.isNaN(v) && v > 0) data.minPlayers = v;
        }
        if (row.maxPlayers !== undefined) {
          const v = Number(row.maxPlayers);
          if (!Number.isNaN(v) && v > 0) data.maxPlayers = v;
        }

        if (row.category !== undefined) data.category = String(row.category);
        if (row.difficulty !== undefined)
          data.difficulty = String(row.difficulty);
        if (row.materials !== undefined)
          data.materials =
            row.materials === null || row.materials === ''
              ? null
              : String(row.materials);

        if (row.rules !== undefined) data.rules = String(row.rules);
        if (row.tips !== undefined)
          data.tips =
            row.tips === null || row.tips === '' ? null : String(row.tips);

        if (row.duration !== undefined) {
          const v = Number(row.duration);
          if (!Number.isNaN(v) && v > 0) data.duration = v;
        }

        if (row.isActive !== undefined) {
          if (typeof row.isActive === 'boolean') {
            data.isActive = row.isActive;
          } else if (
            row.isActive === 'true' ||
            row.isActive === '1' ||
            row.isActive === 1
          ) {
            data.isActive = true;
          } else if (
            row.isActive === 'false' ||
            row.isActive === '0' ||
            row.isActive === 0
          ) {
            data.isActive = false;
          }
        }

        if (row.score !== undefined) {
          const v = Number(row.score);
          if (!Number.isNaN(v)) data.score = v;
        }

        if (row.ratingsCount !== undefined) {
          const v = Number(row.ratingsCount);
          if (!Number.isNaN(v) && v >= 0) data.ratingsCount = v;
        }

        // عدم اجازه ست کردن createdAt / updatedAt از import
        // تا از مقادیر سیستمی استفاده شود

        const existing = await prisma.game.findUnique({ where: { id } });

        if (existing) {
          await prisma.game.update({
            where: { id },
            data,
          });
          updated++;
        } else {
          await prisma.game.create({
            data: {
              id,
              ...data,
            },
          });
          created++;
        }
      } catch (err) {
        console.error('Import row error:', err);
        errors.push({
          rowIndex: index + 2, // +2 برای در نظر گرفتن header و شروع از ردیف 2 در Excel
          message: 'خطا در پردازش این ردیف',
        });
      }
    }

    return NextResponse.json({
      success: true,
      created,
      updated,
      skipped: errors.length,
      errors,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Import games error:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در Import بازی‌ها' },
      { status: 500 }
    );
  }
}



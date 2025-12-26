import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { randomUUID } from 'crypto';

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

const importSchema = z.object({
  rows: z.array(z.record(z.any())),
});

// POST: Import موارد مورد نیاز از Excel (JSON تبدیل‌شده در کلاینت) با upsert بر اساس id
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
        // اگر id خالی بود، یک id جدید می‌سازیم
        let id: string;
        if (!rawId || !String(rawId).trim()) {
          id = randomUUID();
        } else {
          id = String(rawId).trim();
        }

        // ساخت data برای Prisma با توجه به فیلدهای موجود
        const data: any = {};

        if (row.nameFa !== undefined) {
          const nameFa = String(row.nameFa).trim();
          if (!nameFa) {
            errors.push({ rowIndex: index + 2, message: 'nameFa خالی است' });
            continue;
          }
          data.nameFa = nameFa;
        }

        if (row.nameEn !== undefined) {
          const nameEn = String(row.nameEn).trim();
          if (!nameEn) {
            errors.push({ rowIndex: index + 2, message: 'nameEn خالی است' });
            continue;
          }
          data.nameEn = nameEn;
        }

        // عدم اجازه ست کردن createdAt / updatedAt از import
        // تا از مقادیر سیستمی استفاده شود

        const existing = await prisma.requiredItem.findUnique({ where: { id } });

        if (existing) {
          await prisma.requiredItem.update({
            where: { id },
            data,
          });
          updated++;
        } else {
          // برای create، nameFa و nameEn الزامی هستند
          if (!data.nameFa || !data.nameEn) {
            errors.push({
              rowIndex: index + 2,
              message: 'برای ایجاد جدید، nameFa و nameEn الزامی هستند',
            });
            continue;
          }

          await prisma.requiredItem.create({
            data: {
              id,
              nameFa: data.nameFa,
              nameEn: data.nameEn,
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

    console.error('Import required items error:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در Import موارد مورد نیاز' },
      { status: 500 }
    );
  }
}


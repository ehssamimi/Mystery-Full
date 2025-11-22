import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const loginSchema = z.object({
  phone: z.string().regex(/^09\d{9}$/, 'شماره تلفن معتبر نیست'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone } = loginSchema.parse(body);

    // ایجاد کد تأیید (دیفالت: 111111)
    const code = '111111';
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 دقیقه

    // حذف کدهای قبلی استفاده نشده برای این شماره
    await prisma.verificationCode.updateMany({
      where: {
        phone,
        used: false,
      },
      data: {
        used: true,
      },
    });

    // ایجاد کد جدید
    await prisma.verificationCode.create({
      data: {
        phone,
        code,
        expiresAt,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'کد تأیید ارسال شد',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در ارسال کد تأیید' },
      { status: 500 }
    );
  }
}


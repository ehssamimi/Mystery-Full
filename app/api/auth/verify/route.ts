import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { randomBytes } from 'crypto';

const verifySchema = z.object({
  phone: z.string().regex(/^09\d{9}$/, 'شماره تلفن معتبر نیست'),
  code: z.string().length(6, 'کد باید 6 رقمی باشد'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, code } = verifySchema.parse(body);

    // بررسی کد تأیید
    const verificationCode = await prisma.verificationCode.findFirst({
      where: {
        phone,
        code,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!verificationCode) {
      return NextResponse.json(
        { success: false, error: 'کد تأیید نامعتبر یا منقضی شده است' },
        { status: 400 }
      );
    }

    // علامت‌گذاری کد به عنوان استفاده شده
    await prisma.verificationCode.update({
      where: { id: verificationCode.id },
      data: { used: true },
    });

    // پیدا کردن یا ایجاد کاربر
    let user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          role: 'user',
        },
      });
    }

    // ایجاد session token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 روز

    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // حذف session های منقضی شده
    await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        phone: user.phone,
        role: user.role,
      },
    });

    // تنظیم cookie
    response.cookies.set('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 روز
      path: '/',
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Verify error:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در تأیید کد' },
      { status: 500 }
    );
  }
}


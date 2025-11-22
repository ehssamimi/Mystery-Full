import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('session_token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'احراز هویت نشده‌اید' },
        { status: 401 }
      );
    }

    // پیدا کردن session
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      // حذف session منقضی شده
      if (session) {
        await prisma.session.delete({ where: { id: session.id } });
      }

      const response = NextResponse.json(
        { success: false, error: 'Session منقضی شده است' },
        { status: 401 }
      );
      response.cookies.delete('session_token');
      return response;
    }

    return NextResponse.json({
      success: true,
      user: {
        id: session.user.id,
        phone: session.user.phone,
        role: session.user.role,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در دریافت اطلاعات کاربر' },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('session_token')?.value;

    if (token) {
      // حذف session از دیتابیس
      await prisma.session.deleteMany({
        where: { token },
      });
    }

    const response = NextResponse.json({
      success: true,
      message: 'با موفقیت خارج شدید',
    });

    // حذف cookie
    response.cookies.delete('session_token');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در خروج از سیستم' },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/lib/cloudinary';
import { prisma } from '@/lib/prisma';

// Helper برای چک کردن نقش ادمین
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

export async function POST(request: NextRequest) {
  try {
    // چک کردن دسترسی ادمین
    const adminCheck = await checkAdmin(request);
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { success: false, error: adminCheck.error },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'فایل تصویر ارسال نشده است' },
        { status: 400 }
      );
    }

    // اعتبارسنجی نوع فایل
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'نوع فایل مجاز نیست. فقط JPG, PNG, WebP' },
        { status: 400 }
      );
    }

    // اعتبارسنجی اندازه فایل (حداکثر 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'حجم فایل بیش از 5MB است' },
        { status: 400 }
      );
    }

    // تبدیل فایل به Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // آپلود به Cloudinary
    const imageUrl = await uploadImage(buffer, 'games');

    return NextResponse.json({
      success: true,
      imageUrl,
    });
  } catch (error) {
    console.error('خطا در آپلود تصویر:', error);
    const errorMessage = error instanceof Error ? error.message : 'خطا در آپلود تصویر';
    
    // بررسی اینکه آیا environment variables تنظیم شده‌اند
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Environment variables برای Cloudinary تنظیم نشده‌اند');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Environment variables برای Cloudinary تنظیم نشده‌اند. لطفاً CLOUDINARY_CLOUD_NAME، CLOUDINARY_API_KEY و CLOUDINARY_API_SECRET را در .env.local تنظیم کنید.' 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: process.env.NODE_ENV === 'development' ? errorMessage : 'خطا در آپلود تصویر' 
      },
      { status: 500 }
    );
  }
}


import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('session_token')?.value;

  // صفحات عمومی که نیاز به auth ندارند
  const publicPaths = ['/login', '/api/auth/login', '/api/auth/verify', '/api/setup', '/api/games'];
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // اگر صفحه عمومی است، اجازه دسترسی بده
  if (isPublicPath) {
    return NextResponse.next();
  }

  // اگر لاگین نیست و می‌خواهد به صفحات محافظت شده برود
  if (!token) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json(
        { success: false, error: 'احراز هویت نشده‌اید' },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // بررسی دقیق session در API routes انجام می‌شود
  // اینجا فقط چک می‌کنیم که token وجود دارد
  // اگر می‌خواهد به صفحه login برود و token دارد، redirect کن
  if (pathname === '/login') {
    // بررسی دقیق role در client-side انجام می‌شود
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};


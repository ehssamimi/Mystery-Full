'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, hasChecked, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
    // ما می‌خواهیم فقط یک بار در سطح لایه ادمین وضعیت احراز هویت را چک کنیم
    // سایر صفحات ادمین دیگر checkAuth را صدا نمی‌زنند
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // تا وقتی وضعیت احراز هویت مشخص نشده، redirect نکن
    if (!hasChecked) return;

    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/login');
    }
  }, [isAuthenticated, user, hasChecked, router]);

  // تا قبل از اتمام checkAuth فقط لودر نشان بده، نه صفحه لاگین
  if (isLoading || !hasChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl glow-text">در حال بارگذاری...</div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return <>{children}</>;
}


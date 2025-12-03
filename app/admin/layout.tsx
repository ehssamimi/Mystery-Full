'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { useLanguageStore } from '@/lib/store/language-store';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, hasChecked, checkAuth } = useAuthStore();
  const { isRTL } = useLanguageStore();

  useEffect(() => {
    checkAuth();
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

  return (
    <div className="min-h-screen">
      <AdminSidebar />
      <div className={`flex-1 overflow-auto md:min-h-screen ${
        isRTL ? 'md:mr-64' : 'md:ml-64'
      }`}>
        {children}
      </div>
    </div>
  );
}


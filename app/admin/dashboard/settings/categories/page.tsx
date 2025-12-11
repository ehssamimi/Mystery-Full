'use client';

import { useLanguageStore } from '@/lib/store/language-store';
import BaseData from '@/components/admin/BaseData';

export default function CategoriesSettingsPage() {
  const { language } = useLanguageStore();

  return (
    <BaseData
      apiPath="/api/admin/settings/categories"
      exportApiPath="/api/admin/settings/categories/export"
      importApiPath="/api/admin/settings/categories/import"
      baseName="category"
      deleteMessage={
        language === 'fa'
          ? 'آیا مطمئن هستید که می‌خواهید این دسته‌بندی را حذف کنید؟'
          : 'Are you sure you want to delete this category?'
      }
    />
  );
}

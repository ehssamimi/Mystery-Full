'use client';

import { useLanguageStore } from '@/lib/store/language-store';
import BaseData from '@/components/admin/BaseData';

export default function RequiredItemsSettingsPage() {
  const { language } = useLanguageStore();

  return (
    <BaseData
      apiPath="/api/admin/settings/required-items"
      exportApiPath="/api/admin/settings/required-items/export"
      importApiPath="/api/admin/settings/required-items/import"
      baseName="requiredItem"
      deleteMessage={
        language === 'fa'
          ? 'آیا مطمئن هستید که می‌خواهید این مورد مورد نیاز را حذف کنید؟'
          : 'Are you sure you want to delete this required item?'
      }
    />
  );
}

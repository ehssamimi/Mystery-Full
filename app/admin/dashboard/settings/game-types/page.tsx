'use client';

import { useLanguageStore } from '@/lib/store/language-store';
import BaseData from '@/components/admin/BaseData';

export default function GameTypesSettingsPage() {
  const { language } = useLanguageStore();

  return (
    <BaseData
      apiPath="/api/admin/settings/game-types"
      exportApiPath="/api/admin/settings/game-types/export"
      importApiPath="/api/admin/settings/game-types/import"
      baseName="gameType"
      deleteMessage={
        language === 'fa'
          ? 'آیا مطمئن هستید که می‌خواهید این نوع بازی را حذف کنید؟'
          : 'Are you sure you want to delete this game type?'
      }
    />
  );
}


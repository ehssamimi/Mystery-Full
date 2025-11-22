'use client';

import { useEffect } from 'react';
import { useLanguageStore } from '@/lib/store/language-store';

export default function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { language, isRTL, setLanguage } = useLanguageStore();

  useEffect(() => {
    // Initialize language on mount
    if (typeof window !== 'undefined') {
      document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
      document.documentElement.lang = language;
    }
  }, [language, isRTL]);

  return <>{children}</>;
}


import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Language = 'fa' | 'en';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  isRTL: boolean;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'fa',
      isRTL: true,
      setLanguage: (lang: Language) => {
        set({
          language: lang,
          isRTL: lang === 'fa',
        });
        // Update HTML dir attribute
        if (typeof window !== 'undefined') {
          document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
          document.documentElement.lang = lang;
        }
      },
    }),
    {
      name: 'language-storage',
      onRehydrateStorage: () => (state) => {
        if (state && typeof window !== 'undefined') {
          document.documentElement.dir = state.isRTL ? 'rtl' : 'ltr';
          document.documentElement.lang = state.language;
        }
      },
    }
  )
);


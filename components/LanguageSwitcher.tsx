'use client';

import { motion } from 'framer-motion';
import { useLanguageStore } from '@/lib/store/language-store';
import { translations } from '@/lib/translations';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguageStore();
  const t = translations[language];

  return (
    <div className="flex items-center gap-2 bg-bg-tertiary/50 rounded-lg p-1 border border-accent/20">
      <motion.button
        onClick={() => setLanguage('fa')}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
          language === 'fa'
            ? 'bg-accent text-white'
            : 'text-text-secondary hover:text-text-primary'
        }`}
      >
        {t.persian}
      </motion.button>
      <motion.button
        onClick={() => setLanguage('en')}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
          language === 'en'
            ? 'bg-accent text-white'
            : 'text-text-secondary hover:text-text-primary'
        }`}
      >
        {t.english}
      </motion.button>
    </div>
  );
}


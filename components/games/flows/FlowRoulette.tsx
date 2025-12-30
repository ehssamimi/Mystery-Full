'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLanguageStore } from '@/lib/store/language-store';
import { translations } from '@/lib/translations';
import { Dataset } from '@/types/game';
import WheelOfFortune from '@/components/games/WheelOfFortune';

interface FlowRouletteProps {
  playerCount: number;
  datasets: Dataset[];
}

export default function FlowRoulette({ playerCount, datasets }: FlowRouletteProps) {
  const { language } = useLanguageStore();
  const t = translations[language];

  // استخراج تمام آیتم‌ها از datasets
  const items = useMemo(() => {
    const allItems: string[] = [];
    datasets.forEach((dataset) => {
      dataset.items.forEach((item) => {
        // استفاده از nameFa برای فارسی و nameEn برای انگلیسی
        allItems.push(language === 'fa' ? item.nameFa : item.nameEn);
      });
    });
    return allItems;
  }, [datasets, language]);

  // Handle item selection
  const handleItemSelected = (item: string, index: number) => {
    // می‌توانی اینجا منطق اضافی اضافه کنی، مثلاً ذخیره در دیتابیس
    console.log('Selected item:', item, 'at index:', index);
  };

  // اگر هیچ آیتمی وجود نداشت
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-bg-primary">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <h2 className="text-2xl font-bold glow-text mb-4">
            {language === 'fa' ? 'هیچ آیتمی برای نمایش وجود ندارد' : 'No items available'}
          </h2>
          {/* Back button removed - now handled by GameHub */}
          {/* {onBack && (
            <motion.button
              onClick={onBack}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary mt-4"
            >
              {t.backToHome}
            </motion.button>
          )} */}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-bg-primary relative">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-bg-primary via-bg-secondary/30 to-bg-primary pointer-events-none" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-6 sm:mb-8 relative z-10"
      >
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold glow-text mb-2">
          {language === 'fa' ? 'گردونه شانس' : 'Wheel of Fortune'}
        </h1>
        <p className="text-text-secondary text-sm sm:text-base">
          {language === 'fa' 
            ? 'روی دکمه وسط کلیک کن تا گردونه بچرخد' 
            : 'Click the center button to spin the wheel'}
        </p>
      </motion.div>

      {/* Wheel of Fortune Component */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, type: 'spring', damping: 20, stiffness: 300 }}
        className="relative z-10 w-full max-w-2xl"
      >
        <WheelOfFortune
          items={items}
          onSelect={handleItemSelected}
          size="lg"
          className="w-full"
          spinDuration={5000}
          minSpins={5}
        />
      </motion.div>

      {/* Back Button - Removed, now handled by GameHub */}
      {/* {onBack && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6 sm:mt-8 relative z-10"
        >
          <motion.button
            onClick={onBack}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 sm:px-8 sm:py-4 bg-bg-secondary hover:bg-bg-tertiary text-text-primary rounded-xl border border-accent/30 transition-all font-semibold"
          >
            {t.backToHome}
          </motion.button>
        </motion.div>
      )} */}
    </div>
  );
}


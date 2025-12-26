'use client';

import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useLanguageStore } from '@/lib/store/language-store';
import { translations } from '@/lib/translations';

interface PeelRevealCardsProps {
  frontText: string;
  backText: string;
  className?: string;
}

export default function PeelRevealCards({
  frontText,
  backText,
  className = '',
}: PeelRevealCardsProps) {
  const { language } = useLanguageStore();
  const t = translations[language];
  // Motion value برای track کردن موقعیت drag
  const y = useMotionValue(0);
  
  // مقدار حداکثر drag به بالا (منفی = بالا)
  const maxDragUp = -280;

  // Transform برای opacity کارت پشتی: 0 تا 1 وقتی y از 0 تا maxDragUp
  const backOpacity = useTransform(y, [0, maxDragUp], [0, 1]);
  
  // Transform برای translateY کارت پشتی: 12 تا 0 وقتی y از 0 تا maxDragUp
  const backTranslateY = useTransform(y, [0, maxDragUp], [12, 0]);

  // Handle drag end - همیشه فوراً به 0 برگردد
  const handleDragEnd = () => {
    animate(y, 0, {
      type: 'spring',
      damping: 25,
      stiffness: 400,
    });
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative w-[320px] sm:w-[360px] h-[340px] sm:h-[380px]">
        {/* کارت پشتی */}
        <motion.div
          className="absolute inset-0 rounded-2xl bg-[var(--bg-secondary)] border border-[rgba(108,92,231,0.3)] shadow-xl p-6 sm:p-8 flex items-center justify-center"
          style={{
            opacity: backOpacity,
            translateY: backTranslateY,
            zIndex: 0,
          }}
        >
          <p className="text-center text-lg sm:text-xl md:text-2xl font-semibold text-text-primary">
            {backText}
          </p>
        </motion.div>

        {/* کارت جلویی */}
        <motion.div
          drag="y"
          dragConstraints={{ top: maxDragUp, bottom: 0 }}
          dragElastic={0}
          onDragEnd={handleDragEnd}
          style={{
            y,
            zIndex: 20,
            cursor: 'grab',
          }}
          whileDrag={{ cursor: 'grabbing' }}
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-tertiary)] border-2 border-[rgba(108,92,231,0.5)] shadow-2xl glow-sm p-6 sm:p-8 flex items-center justify-center touch-none select-none"
        >
          <p className="text-center text-lg sm:text-xl md:text-2xl font-semibold text-text-primary">
            {frontText}
          </p>
          
          {/* نشانگر drag (فقط در desktop) */}
          <div className="hidden sm:block absolute bottom-4 left-1/2 transform -translate-x-1/2 text-text-secondary text-sm opacity-60">
            ↓ {t.dragUp}
          </div>
        </motion.div>
      </div>
    </div>
  );
}


'use client';

import { motion, useMotionValue, useTransform, animate, useMotionValueEvent } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useLanguageStore } from '@/lib/store/language-store';
import { translations } from '@/lib/translations';

interface PeelRevealCardsProps {
  frontText: string;
  backText: string;
  className?: string;
  onReveal?: () => void;
  isRevealed?: boolean;
}

export default function PeelRevealCards({
  frontText,
  backText,
  className = '',
  onReveal,
  isRevealed = false,
}: PeelRevealCardsProps) {
  const { language } = useLanguageStore();
  const t = translations[language];
  // Motion value برای track کردن موقعیت drag
  const y = useMotionValue(0);
  const [hasBeenRevealed, setHasBeenRevealed] = useState(isRevealed);
  
  // مقدار حداکثر drag به بالا (منفی = بالا)
  const maxDragUp = -280;
  // Threshold برای تشخیص اینکه کارت باز شده (حدود 70% از maxDragUp)
  const revealThreshold = maxDragUp * 0.7; // حدود -196

  // Transform برای opacity کارت پشتی: 0 تا 1 وقتی y از 0 تا maxDragUp
  const backOpacity = useTransform(y, [0, maxDragUp], [0, 1]);
  
  // Transform برای translateY کارت پشتی: 12 تا 0 وقتی y از 0 تا maxDragUp
  const backTranslateY = useTransform(y, [0, maxDragUp], [12, 0]);

  // Detect when card is revealed
  useMotionValueEvent(y, 'change', (latest) => {
    if (!hasBeenRevealed && latest <= revealThreshold) {
      setHasBeenRevealed(true);
      if (onReveal) {
        onReveal();
      }
    }
  });

  // Reset hasBeenRevealed when isRevealed prop changes
  useEffect(() => {
    setHasBeenRevealed(isRevealed);
  }, [isRevealed]);

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
          
          {/* نشانگر drag - در پایین وسط با فلش بالا */}
          {!hasBeenRevealed && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-text-secondary text-xs sm:text-sm opacity-70 flex flex-col items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 sm:h-5 sm:w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
              <span className="text-center">
                {t.pleaseDragCardUp}
              </span>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}


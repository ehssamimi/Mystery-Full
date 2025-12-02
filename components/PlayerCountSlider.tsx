'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { setPlayerCount } from '@/lib/storage';
import { useLanguageStore } from '@/lib/store/language-store';
import { translations } from '@/lib/translations';

export default function PlayerCountSlider() {
  const [playerCount, setPlayerCountState] = useState(2);
  const [holdType, setHoldType] = useState<'increment' | 'decrement' | null>(null);
  const router = useRouter();
  const { language, isRTL } = useLanguageStore();
  const t = translations[language];
  
  // Refs for long press functionality
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef(false);
  const playerCountRef = useRef(playerCount);
  
  // Keep ref in sync with state
  useEffect(() => {
    playerCountRef.current = playerCount;
  }, [playerCount]);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Handle continuous increment/decrement when holding
  useEffect(() => {
    // Clear any existing interval first
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (holdType === 'increment' || holdType === 'decrement') {
      intervalRef.current = setInterval(() => {
        setPlayerCountState((prev) => {
          if (holdType === 'increment') {
            const next = Math.min(20, prev + 1);
            if (next >= 20) {
              setHoldType(null);
            }
            return next;
          } else {
            const next = Math.max(2, prev - 1);
            if (next <= 2) {
              setHoldType(null);
            }
            return next;
          }
        });
      }, 70); // long press سرعت بیشتر
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [holdType]);

  // Start press (decide later if it is click or long-press)
  const handlePressStart = (type: 'increment' | 'decrement') => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    isLongPressRef.current = false;
    timeoutRef.current = setTimeout(() => {
      const currentValue = playerCountRef.current;
      if (
        (type === 'increment' && currentValue < 20) ||
        (type === 'decrement' && currentValue > 2)
      ) {
        isLongPressRef.current = true;
        setHoldType(type);
      }
    }, 300); // بعد از 300ms long-press حساب می‌شود
  };

  // Stop press
  const handlePressEnd = (type: 'increment' | 'decrement') => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    // اگر long-press نشده، این یک کلیک ساده است → یک واحد تغییر بده
    if (!isLongPressRef.current) {
      setPlayerCountState((prev) => {
        if (type === 'increment') {
          return Math.min(20, prev + 1);
        }
        return Math.max(2, prev - 1);
      });
    }
    setHoldType(null);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Handle touch events for mobile
  const handleTouchStart = (type: 'increment' | 'decrement', e: React.TouchEvent) => {
    e.preventDefault();
    handlePressStart(type);
  };

  const handleTouchEnd = (type: 'increment' | 'decrement', e: React.TouchEvent) => {
    e.preventDefault();
    handlePressEnd(type);
  };

  // Handle mouse leave (stop if user drags away)
  const handleMouseLeave = () => {
    setHoldType(null);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleStart = () => {
    setPlayerCount(playerCount);
    router.push(`/games?players=${playerCount}`);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center pt-24 p-4 relative z-10">
      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="text-5xl md:text-7xl font-bold mb-4 glow-text text-center"
      >
        {t.appTitle}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="text-xl md:text-2xl text-text-secondary mb-12 text-center"
      >
        {t.howManyPlayers}
      </motion.p>

      {/* Player Count Container with Plus/Minus Buttons */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.6, type: 'spring', stiffness: 200, damping: 20 }}
        className="w-full max-w-4xl"
      >
        {/* Counter Display with Buttons */}
        <div className="flex items-center justify-center gap-4 md:gap-8 mb-8" dir={isRTL ? 'rtl' : 'ltr'}>
          {/* Minus Button */}
          <motion.button
            initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.4, ease: 'easeOut' }}
            whileHover={{ scale: 1.1, boxShadow: '0 0 30px var(--glow-secondary)' }}
            whileTap={{ scale: 0.95 }}
            onMouseDown={() => handlePressStart('decrement')}
            onMouseUp={() => handlePressEnd('decrement')}
            onMouseLeave={handleMouseLeave}
            onTouchStart={(e) => handleTouchStart('decrement', e)}
            onTouchEnd={(e) => handleTouchEnd('decrement', e)}
            disabled={playerCount <= 2}
            className={`
              w-16 h-16 md:w-20 md:h-20 rounded-full
              flex items-center justify-center
              bg-bg-secondary border-2 border-accent
              text-3xl md:text-4xl font-bold text-text-primary
              transition-all duration-200 ease-out
              glow-sm
              disabled:opacity-40 disabled:cursor-not-allowed
              disabled:hover:scale-100 disabled:hover:shadow-none
              hover:bg-accent/20 hover:border-accent-glow
              active:bg-accent/30
              focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg-primary
              select-none
            `}
            aria-label={t.decrease || 'Decrease'}
          >
            <motion.span
              animate={playerCount <= 2 ? { opacity: 0.4 } : { opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              −
            </motion.span>
          </motion.button>

          {/* Display Number */}
          <motion.div
            key={playerCount}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="text-center flex-1"
          >
            <div className="text-9xl md:text-[12rem] font-bold glow-text">
              {playerCount}
            </div>
            <p className="text-2xl md:text-3xl text-text-secondary mt-4">
              {t.player}
            </p>
          </motion.div>

          {/* Plus Button */}
          <motion.button
            initial={{ opacity: 0, x: isRTL ? -50 : 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.4, ease: 'easeOut' }}
            whileHover={{ scale: 1.1, boxShadow: '0 0 30px var(--glow-secondary)' }}
            whileTap={{ scale: 0.95 }}
            onMouseDown={() => handlePressStart('increment')}
            onMouseUp={() => handlePressEnd('increment')}
            onMouseLeave={handleMouseLeave}
            onTouchStart={(e) => handleTouchStart('increment', e)}
            onTouchEnd={(e) => handleTouchEnd('increment', e)}
            disabled={playerCount >= 20}
            className={`
              w-16 h-16 md:w-20 md:h-20 rounded-full
              flex items-center justify-center
              bg-bg-secondary border-2 border-accent
              text-3xl md:text-4xl font-bold text-text-primary
              transition-all duration-200 ease-out
              glow-sm
              disabled:opacity-40 disabled:cursor-not-allowed
              disabled:hover:scale-100 disabled:hover:shadow-none
              hover:bg-accent/20 hover:border-accent-glow
              active:bg-accent/30
              focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg-primary
              select-none
            `}
            aria-label={t.increase || 'Increase'}
          >
            <motion.span
              animate={playerCount >= 20 ? { opacity: 0.4 } : { opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              +
            </motion.span>
          </motion.button>
        </div>

        {/* Min/Max Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.4 }}
          className="flex justify-center gap-4 text-sm md:text-base text-text-secondary"
        >
          <span>{t.minPlayers || 'حداقل'}: 2</span>
          <span>•</span>
          <span>{t.maxPlayers || 'حداکثر'}: 20</span>
        </motion.div>
      </motion.div>

      {/* Start Button */}
      <motion.button
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleStart}
        className="btn-primary mt-12 glow-lg"
      >
        {t.startGame}
      </motion.button>

    </div>
  );
}


'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { setPlayerCount } from '@/lib/storage';
import { useLanguageStore } from '@/lib/store/language-store';
import { translations } from '@/lib/translations';

export default function PlayerCountSlider() {
  const [playerCount, setPlayerCountState] = useState(2);
  const [isHolding, setIsHolding] = useState<'increment' | 'decrement' | null>(null);
  const router = useRouter();
  const { language, isRTL } = useLanguageStore();
  const t = translations[language];
  
  // Refs for long press functionality
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
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

  // Handle continuous increment/decrement
  useEffect(() => {
    // Clear any existing interval first
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isHolding === 'increment' && playerCount < 20) {
      intervalRef.current = setInterval(() => {
        setPlayerCountState((prev) => {
          const newValue = Math.min(20, prev + 1);
          // Stop if we reached max
          if (newValue >= 20) {
            setIsHolding(null);
          }
          return newValue;
        });
      }, 100); // Update every 100ms for smooth continuous change
    } else if (isHolding === 'decrement' && playerCount > 2) {
      intervalRef.current = setInterval(() => {
        setPlayerCountState((prev) => {
          const newValue = Math.max(2, prev - 1);
          // Stop if we reached min
          if (newValue <= 2) {
            setIsHolding(null);
          }
          return newValue;
        });
      }, 100);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isHolding, playerCount]);

  // Start holding (with initial delay)
  const handleMouseDown = (type: 'increment' | 'decrement') => {
    // First click happens immediately
    setPlayerCountState((prev) => {
      if (type === 'increment' && prev < 20) {
        return Math.min(20, prev + 1);
      } else if (type === 'decrement' && prev > 2) {
        return Math.max(2, prev - 1);
      }
      return prev;
    });

    // After 300ms delay, start continuous increment/decrement
    timeoutRef.current = setTimeout(() => {
      // Check current value using ref to get latest state
      const currentValue = playerCountRef.current;
      if (
        (type === 'increment' && currentValue < 20) ||
        (type === 'decrement' && currentValue > 2)
      ) {
        setIsHolding(type);
      }
    }, 300);
  };

  // Stop holding
  const handleMouseUp = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsHolding(null);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Handle touch events for mobile
  const handleTouchStart = (type: 'increment' | 'decrement', e: React.TouchEvent) => {
    e.preventDefault();
    handleMouseDown(type);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    handleMouseUp();
  };

  // Handle mouse leave (stop if user drags away)
  const handleMouseLeave = () => {
    handleMouseUp();
  };

  const handleStart = () => {
    setPlayerCount(playerCount);
    router.push(`/games?players=${playerCount}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center pt-20 md:pt-24 p-4 relative z-10">
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
            onMouseDown={() => handleMouseDown('decrement')}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onTouchStart={(e) => handleTouchStart('decrement', e)}
            onTouchEnd={handleTouchEnd}
            onClick={() => {
              // Single click is handled by onMouseDown, but we keep this for accessibility
              if (!isHolding) {
                setPlayerCountState(Math.max(2, playerCount - 1));
              }
            }}
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
            onMouseDown={() => handleMouseDown('increment')}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onTouchStart={(e) => handleTouchStart('increment', e)}
            onTouchEnd={handleTouchEnd}
            onClick={() => {
              // Single click is handled by onMouseDown, but we keep this for accessibility
              if (!isHolding) {
                setPlayerCountState(Math.min(20, playerCount + 1));
              }
            }}
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


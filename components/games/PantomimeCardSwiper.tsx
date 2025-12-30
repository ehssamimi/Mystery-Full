'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguageStore } from '@/lib/store/language-store';
import { translations } from '@/lib/translations';
import { PANTOMIME_CONFIG } from '@/lib/config/pantomime-game';
import PantomimeCard, { PantomimeSwipeType } from './PantomimeCard';

interface Player {
  name: string;
  team: 'A' | 'B';
  score: number;
  skipsRemaining: number;
  words: string[];
}

interface PantomimeCardSwiperProps {
  player: Player;
  onScoreUpdate: (delta: number) => void;
  onSkip: () => void;
  onTurnComplete: () => void;
  isPaused: boolean;
  onPauseToggle: () => void;
}

export default function PantomimeCardSwiper({
  player,
  onScoreUpdate,
  onSkip,
  onTurnComplete,
  isPaused,
  onPauseToggle,
}: PantomimeCardSwiperProps) {
  const { language } = useLanguageStore();
  const t = translations[language];
  const [words, setWords] = useState(player.words);
  const [timeRemaining, setTimeRemaining] = useState<number>(PANTOMIME_CONFIG.TURN_TIME_SECONDS);
  
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer countdown
  useEffect(() => {
    if (isPaused || timeRemaining <= 0) {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      return;
    }

    timerIntervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isPaused, timeRemaining]);

  // Handle time finished
  useEffect(() => {
    if (timeRemaining === 0) {
      setTimeout(() => {
        onTurnComplete();
      }, 500);
    }
  }, [timeRemaining, onTurnComplete]);

  // Reset when player changes
  useEffect(() => {
    setWords(player.words);
    setTimeRemaining(PANTOMIME_CONFIG.TURN_TIME_SECONDS);
  }, [player.name]);

  // Remove card - using useCallback to ensure stable reference
  const removeCard = useCallback((oldWord: string, swipe: PantomimeSwipeType) => {
    // Update score if needed (for swipe actions)
    if (swipe === 'correct' && onScoreUpdate) {
      onScoreUpdate(+1);
    } else if (swipe === 'wrong' && onScoreUpdate) {
      onScoreUpdate(-1);
    }
    
    // Then update words
    setWords((current) => {
      const newWords = current.filter((word) => word !== oldWord);
      
      // Check if this was the last card
      if (newWords.length === 0) {
        setTimeout(() => {
          onTurnComplete();
        }, 300);
      }
      
      return newWords;
    });
  }, [onScoreUpdate, onTurnComplete]);

  // Handle button actions
  const handleCorrect = useCallback(() => {
    if (words.length === 0) return;
    const currentWord = words[words.length - 1];
    
    // Update score first
    onScoreUpdate(+1);
    
    // Then update words
    setWords((current) => {
      const newWords = current.filter((word) => word !== currentWord);
      
      if (newWords.length === 0) {
        setTimeout(() => {
          onTurnComplete();
        }, 300);
      }
      
      return newWords;
    });
  }, [words, onScoreUpdate, onTurnComplete]);

  const handleWrong = useCallback(() => {
    if (words.length === 0) return;
    const currentWord = words[words.length - 1];
    
    // Update score first
    onScoreUpdate(-1);
    
    // Then update words
    setWords((current) => {
      const newWords = current.filter((word) => word !== currentWord);
      
      if (newWords.length === 0) {
        setTimeout(() => {
          onTurnComplete();
        }, 300);
      }
      
      return newWords;
    });
  }, [words, onScoreUpdate, onTurnComplete]);

  const handleSkip = useCallback(() => {
    if (player.skipsRemaining === 0 || words.length === 0) return;
    const currentWord = words[words.length - 1];
    
    // Update skip first
    onSkip();
    
    // Then update words
    setWords((current) => {
      const newWords = current.filter((word) => word !== currentWord);
      
      if (newWords.length === 0) {
        setTimeout(() => {
          onTurnComplete();
        }, 300);
      }
      
      return newWords;
    });
  }, [player.skipsRemaining, words, onSkip, onTurnComplete]);

  // Index of last card (active card) - like in the original project
  const activeIndex = words.length - 1;

  if (words.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center px-4">
          <p className="text-lg text-text-secondary">
            {language === 'fa' ? 'تمام کلمات تمام شد!' : 'All words finished!'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen px-4 py-3 overflow-hidden">
      {/* Timer and Pause */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-3">
        <motion.div
          className="text-4xl md:text-5xl font-bold glow-text"
          style={{ fontFamily: 'monospace' }}
          animate={{ scale: timeRemaining <= 5 ? [1, 1.1, 1] : 1 }}
          transition={{ duration: 0.5, repeat: timeRemaining <= 5 ? Infinity : 0 }}
        >
          {timeRemaining}
        </motion.div>
        
        <motion.button
          onClick={onPauseToggle}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-3 rounded-full bg-bg-secondary/80 backdrop-blur-sm border border-accent/30 hover:bg-bg-secondary transition-all"
        >
          {isPaused ? (
            <svg className="w-6 h-6 text-text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
        </motion.button>
      </div>

      {/* Cards Container */}
      <div className="relative w-full max-w-md sm:max-w-lg md:max-w-2xl h-[300px] sm:h-[350px] md:h-[400px] flex items-center justify-center mb-3 overflow-hidden">
        <AnimatePresence>
          {words.map((word, index) => (
            <PantomimeCard
              key={word}
              word={word}
              active={index === activeIndex}
              removeCard={removeCard}
              onScoreUpdate={onScoreUpdate}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Card Counter */}
      <div className="mb-3 text-center">
        <span className="text-sm sm:text-base text-text-secondary">
          {words.length} / {player.words.length}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 w-full max-w-md justify-center">
        {/* Wrong Button */}
        <motion.button
          onClick={handleWrong}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-all shadow-lg text-sm"
        >
          {t.wrong || 'Wrong'}
        </motion.button>

        {/* Skip Button */}
        <motion.button
          onClick={handleSkip}
          disabled={player.skipsRemaining === 0}
          whileHover={player.skipsRemaining > 0 ? { scale: 1.05 } : {}}
          whileTap={player.skipsRemaining > 0 ? { scale: 0.95 } : {}}
          className="relative flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all shadow-lg text-sm"
        >
          <div className="flex flex-col items-center">
            <span className="text-[10px] mb-0.5">{player.skipsRemaining}</span>
            <span>{t.skip || 'Skip'}</span>
          </div>
        </motion.button>

        {/* Correct Button */}
        <motion.button
          onClick={handleCorrect}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-1 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-all shadow-lg text-sm"
        >
          {t.correct || 'Correct'}
        </motion.button>
      </div>
    </div>
  );
}

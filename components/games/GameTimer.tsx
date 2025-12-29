'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useLanguageStore } from '@/lib/store/language-store';
import { translations } from '@/lib/translations';

interface GameTimerProps {
  initialSeconds: number;
  onComplete?: () => void;
  isRunning: boolean;
  onStop?: () => void;
  onResume?: () => void;
  className?: string;
}

export default function GameTimer({
  initialSeconds,
  onComplete,
  isRunning,
  onStop,
  onResume,
  className = '',
}: GameTimerProps) {
  const { language } = useLanguageStore();
  const t = translations[language];
  const [seconds, setSeconds] = useState(initialSeconds);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onCompleteRef = useRef(onComplete);

  // Keep onComplete ref updated
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Reset timer when initialSeconds changes
  useEffect(() => {
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  // Timer interval logic
  useEffect(() => {
    if (isRunning && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, seconds]);

  // Handle completion when seconds reaches 0
  useEffect(() => {
    if (seconds === 0 && isRunning && onCompleteRef.current) {
      onCompleteRef.current();
    }
  }, [seconds, isRunning]);

  const formatTime = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStop = () => {
    if (onStop) {
      onStop();
    }
  };

  const handleResume = () => {
    if (onResume) {
      onResume();
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Timer Display */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <div
          className="text-8xl md:text-9xl font-bold glow-text"
          style={{
            fontFamily: 'monospace',
            textShadow: '0 0 30px var(--accent-glow), 0 0 60px var(--glow-primary)',
          }}
        >
          {formatTime(seconds)}
        </div>
      </motion.div>

      {/* Control Buttons */}
      <div className="flex gap-4">
        {isRunning && seconds > 0 && (
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStop}
            className="btn-primary px-6 py-3 text-lg"
          >
            {t.stop}
          </motion.button>
        )}
      </div>
    </div>
  );
}


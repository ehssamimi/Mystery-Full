'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguageStore } from '@/lib/store/language-store';
import { translations } from '@/lib/translations';

interface RandomGeneratorScreenProps {
  onComplete: () => void;
}

export function RandomGeneratorScreen({ onComplete }: RandomGeneratorScreenProps) {
  const [dots, setDots] = useState('');
  const { language } = useLanguageStore();
  const t = translations[language];

  useEffect(() => {
    // Animate dots
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    // Complete after 3 seconds
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => {
      clearInterval(dotsInterval);
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-bg-primary via-bg-secondary/50 to-bg-primary pointer-events-none" />
      
      <div className="text-center relative z-10">
        {/* Animated sparkle icon */}
        <motion.div
          className="mb-8 flex justify-center"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent to-accent-glow flex items-center justify-center shadow-2xl glow-lg">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
          </div>
        </motion.div>

        {/* Pulsing circles */}
        <div className="relative h-24 mb-8">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border-2 border-accent/30 mx-auto"
              style={{ width: '100%', maxWidth: '200px' }}
              initial={{ scale: 0, opacity: 1 }}
              animate={{
                scale: [0, 2.5],
                opacity: [1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.6,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-3xl mb-3 glow-text">
            {t.generatingGame || 'در حال احضار بازی'}{dots}
          </h2>
          <p className="text-text-secondary">{t.randomizing || 'تصادفی‌سازی در حال تصمیم‌گیری است'}</p>
        </motion.div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-accent-glow/50 rounded-full"
              initial={{
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400),
                y: typeof window !== 'undefined' ? window.innerHeight + 20 : 600,
              }}
              animate={{
                y: -20,
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: 'linear',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}


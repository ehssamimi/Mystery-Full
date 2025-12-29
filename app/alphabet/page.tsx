'use client';

import { useState } from 'react';
import GameRoulette from '@/components/GameRoulette';
// import UserNavbar from '@/components/UserNavbar'; // Removed - only show on home page
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function AlphabetPage() {
  const router = useRouter();
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  const handleLetterSelected = (letter: string) => {
    setSelectedLetter(letter);
    console.log('حرف انتخاب شده:', letter);
  };

  // اگر حرف انتخاب شده، نمایش بده
  if (selectedLetter) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <motion.h1
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-6xl md:text-8xl font-bold glow-text mb-6"
            >
              {selectedLetter}
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-2xl text-text-secondary mb-8"
            >
              حرف انتخاب شده
            </motion.p>
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSelectedLetter(null);
                router.refresh();
              }}
              className="btn-primary"
            >
              دوباره بچرخان
            </motion.button>
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/')}
              className="btn-primary mt-4"
            >
              بازگشت به خانه
            </motion.button>
          </motion.div>
      </div>
    );
  }

  return (
    <GameRoulette
      onItemSelected={handleLetterSelected}
    />
  );
}


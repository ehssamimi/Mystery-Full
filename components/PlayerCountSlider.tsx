'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { setPlayerCount } from '@/lib/storage';
import { useLanguageStore } from '@/lib/store/language-store';
import { translations } from '@/lib/translations';

export default function PlayerCountSlider() {
  const [playerCount, setPlayerCountState] = useState(2);
  const router = useRouter();
  const { language, isRTL } = useLanguageStore();
  const t = translations[language];

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

      {/* Slider Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.6, type: 'spring', stiffness: 200, damping: 20 }}
        className="w-full max-w-2xl"
      >
        {/* Display Number */}
        <motion.div
          key={playerCount}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center mb-8"
        >
          <div className="text-9xl md:text-[12rem] font-bold glow-text">
            {playerCount}
          </div>
          <p className="text-2xl md:text-3xl text-text-secondary mt-4">
            {t.player}
          </p>
        </motion.div>

        {/* Slider */}
        <div className="relative py-4" dir={isRTL ? 'rtl' : 'ltr'}>
          <input
            type="range"
            min="2"
            max="20"
            value={playerCount}
            onChange={(e) => setPlayerCountState(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-bg-tertiary rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: isRTL
                ? `linear-gradient(to left, var(--accent) 0%, var(--accent) ${
                    ((playerCount - 2) / 18) * 100
                  }%, var(--bg-tertiary) ${((playerCount - 2) / 18) * 100}%, var(--bg-tertiary) 100%)`
                : `linear-gradient(to right, var(--accent) 0%, var(--accent) ${
                    ((playerCount - 2) / 18) * 100
                  }%, var(--bg-tertiary) ${((playerCount - 2) / 18) * 100}%, var(--bg-tertiary) 100%)`,
            }}
          />
        </div>

        {/* Min/Max Labels */}
        <div className="flex justify-between mt-4 text-text-secondary">
          <span>{isRTL ? '20+' : '2'}</span>
          <span>{isRTL ? '2' : '20+'}</span>
        </div>
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

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--accent);
          cursor: pointer;
          box-shadow: 0 0 15px var(--glow-primary), 0 0 30px var(--glow-secondary);
          transition: all 0.2s ease;
          border: 2px solid var(--accent-glow);
        }

        .slider::-webkit-slider-thumb:hover {
          box-shadow: 0 0 20px var(--glow-primary), 0 0 40px var(--glow-secondary);
          transform: scale(1.15);
        }

        .slider::-webkit-slider-thumb:active {
          transform: scale(1.2);
        }

        .slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--accent);
          cursor: pointer;
          border: 2px solid var(--accent-glow);
          box-shadow: 0 0 15px var(--glow-primary), 0 0 30px var(--glow-secondary);
          transition: all 0.2s ease;
        }

        .slider::-moz-range-thumb:hover {
          box-shadow: 0 0 20px var(--glow-primary), 0 0 40px var(--glow-secondary);
          transform: scale(1.15);
        }

        .slider::-moz-range-thumb:active {
          transform: scale(1.2);
        }
      `}</style>
    </div>
  );
}


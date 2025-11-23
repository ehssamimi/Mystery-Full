'use client';

import { motion } from 'framer-motion';
import { Game } from '@/types/game';
import { useRouter } from 'next/navigation';
import { addToHistory, addToFavorites, removeFromFavorites, isFavorite } from '@/lib/storage';
import { useLanguageStore } from '@/lib/store/language-store';
import { translations } from '@/lib/translations';
import { useState, useEffect } from 'react';

interface GameDetailsProps {
  game: Game;
  playerCount: number;
}

export default function GameDetails({ game, playerCount }: GameDetailsProps) {
  const router = useRouter();
  const { language } = useLanguageStore();
  const t = translations[language];
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    const checkFavorite = async () => {
      const isFav = await isFavorite(game.id);
      setFavorite(isFav);
    };
    checkFavorite();
    addToHistory(game.id, playerCount);
  }, [game.id, playerCount]);

  const handleFavorite = async () => {
    if (favorite) {
      await removeFromFavorites(game.id);
    } else {
      await addToFavorites(game.id);
    }
    setFavorite(!favorite);
  };

  const difficultyColors = {
    easy: '#4ecdc4',
    medium: '#ffe66d',
    hard: '#ff6b6b',
  };

  const difficultyLabels = {
    easy: t.easy,
    medium: t.medium,
    hard: t.hard,
  };

  return (
    <div className="min-h-screen pt-20 md:pt-24 p-4 md:p-8 relative z-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <motion.h1
            className="text-5xl md:text-7xl font-bold glow-text mb-4"
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {game.name}
          </motion.h1>
          <p className="text-xl md:text-2xl text-text-secondary">
            {game.nameEn}
          </p>
        </motion.div>

        {/* Special Message */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="card glow-lg mb-8 text-center p-6 md:p-8"
        >
          <motion.p
            className="text-2xl md:text-3xl font-bold mb-2"
            style={{ color: 'var(--accent-glow)' }}
          >
            🎮 {t.gameSelectedForYou}
          </motion.p>
          <p className="text-lg md:text-xl text-text-secondary mt-4">
            {t.gameSelectedMessage}
          </p>
        </motion.div>

        {/* Game Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card text-center p-4"
          >
            <div className="text-3xl mb-2">👥</div>
            <div className="text-sm text-text-secondary mb-1">{t.playerCount}</div>
            <div className="text-xl font-bold">
              {game.minPlayers === game.maxPlayers
                ? game.minPlayers
                : `${game.minPlayers}-${game.maxPlayers}`}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card text-center p-4"
          >
            <div className="text-3xl mb-2">⏱️</div>
            <div className="text-sm text-text-secondary mb-1">{t.durationLabel}</div>
            <div className="text-xl font-bold">{game.duration} {t.minutes}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card text-center p-4"
          >
            <div className="text-3xl mb-2">📊</div>
            <div className="text-sm text-text-secondary mb-1">{t.difficultyLabel}</div>
            <div
              className="text-xl font-bold"
              style={{ color: difficultyColors[game.difficulty] }}
            >
              {difficultyLabels[game.difficulty]}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="card text-center p-4"
          >
            <div className="text-3xl mb-2">🎯</div>
            <div className="text-sm text-text-secondary mb-1">{t.categoryLabel}</div>
            <div className="text-xl font-bold">{game.category}</div>
          </motion.div>
        </div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="card mb-6"
        >
          <h2 className="text-2xl font-bold mb-4 glow-text">📝 {t.aboutGame}</h2>
          <p className="text-lg text-text-secondary leading-relaxed">
            {game.description}
          </p>
        </motion.div>

        {/* Rules */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="card mb-6"
        >
          <h2 className="text-2xl font-bold mb-4 glow-text">📋 {t.gameRules}</h2>
          <div className="text-lg text-text-secondary leading-relaxed whitespace-pre-line">
            {game.rules}
          </div>
        </motion.div>

        {/* Tips */}
        {game.tips && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="card mb-6"
          >
            <h2 className="text-2xl font-bold mb-4 glow-text">💡 {t.importantTips}</h2>
            <p className="text-lg text-text-secondary leading-relaxed">
              {game.tips}
            </p>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleFavorite}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              favorite
                ? 'bg-accent text-white glow'
                : 'bg-bg-secondary text-text-primary border border-accent'
            }`}
          >
            {favorite ? `❤️ ${t.inFavorites}` : `🤍 ${t.addToFavorites}`}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/')}
            className="btn-primary"
          >
            🏠 {t.backToHome}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}


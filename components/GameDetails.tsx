'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Game } from '@/types/game';
import { useRouter } from 'next/navigation';
import { addToHistory, addToFavorites, removeFromFavorites, isFavorite } from '@/lib/storage';
import { useLanguageStore } from '@/lib/store/language-store';
import { translations } from '@/lib/translations';
import { useState, useEffect } from 'react';
import RatingStars from './RatingStars';

interface GameDetailsProps {
  game: Game;
  playerCount: number;
}

export default function GameDetails({ game, playerCount }: GameDetailsProps) {
  const router = useRouter();
  const { language } = useLanguageStore();
  const t = translations[language];
  const [favorite, setFavorite] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [averageScore, setAverageScore] = useState<number | null>(null);
  const [ratingsCount, setRatingsCount] = useState<number | null>(null);
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [pendingRating, setPendingRating] = useState(5);
  const [redirectAfterRate, setRedirectAfterRate] = useState(false);

  useEffect(() => {
    const checkFavoriteAndRating = async () => {
      const isFav = await isFavorite(game.id);
      setFavorite(isFav);

      try {
        const res = await fetch(`/api/games/${game.id}/rating`, {
          credentials: 'include',
        });
        const data = await res.json();
        if (data.success) {
          setUserRating(data.userRating ?? null);
          setAverageScore(data.game?.score ?? null);
          setRatingsCount(data.game?.ratingsCount ?? null);
        }
      } catch (error) {
        console.error('Error fetching rating:', error);
      }
    };

    checkFavoriteAndRating();
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

  const openRatingModal = (options?: { redirectAfter?: boolean }) => {
    setPendingRating(userRating ?? 5);
    setRedirectAfterRate(Boolean(options?.redirectAfter));
    setIsRateModalOpen(true);
  };

  const handleSubmitRating = async () => {
    try {
      const res = await fetch(`/api/games/${game.id}/rating`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ score: pendingRating }),
      });
      const data = await res.json();
      if (data.success) {
        setUserRating(data.userRating);
        setAverageScore(data.game?.score ?? data.userRating);
        setRatingsCount(data.game?.ratingsCount ?? null);
        setIsRateModalOpen(false);
        // اگر از دکمه «بازگشت به خانه» آمده بود، بعد از ثبت امتیاز برگرد به خانه
        if (redirectAfterRate) {
          setRedirectAfterRate(false);
          router.push('/');
        }
      } else {
        console.error('Rating error:', data.error);
      }
    } catch (error) {
      console.error('Error saving rating:', error);
    }
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
            {favorite ? `❤️ ${t.favoriteGame}` : `🤍 ${t.addToFavorites}`}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => openRatingModal({ redirectAfter: false })}
            className="px-6 py-3 rounded-xl font-semibold transition-all bg-bg-secondary text-text-primary border border-accent flex items-center gap-2"
          >
            <span>⭐</span>
            {userRating != null ? (
              <span>
                {t.yourRating}: {userRating.toFixed(1)}
              </span>
            ) : (
              <span>{t.rateGame}</span>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push(`/games/${game.id}/play?players=${playerCount}`)}
            className="px-6 py-3 rounded-xl font-semibold transition-all bg-accent hover:bg-accent-glow text-white glow"
          >
            🎮 {t.playGame}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => openRatingModal({ redirectAfter: true })}
            className="btn-primary"
          >
            🏠 {t.backToHome}
          </motion.button>
        </motion.div>

        {/* Average score display */}
        {averageScore != null && (
          <div className="mt-4 flex flex-col items-center gap-1 text-sm text-text-secondary">
            <div className="flex items-center gap-2">
              <RatingStars value={averageScore} readOnly size="sm" />
              <span>{averageScore.toFixed(1)} / 5</span>
            </div>
            {ratingsCount != null && (
              <span>
                ({ratingsCount.toLocaleString()} {language === 'fa' ? 'رأی' : 'votes'})
              </span>
            )}
          </div>
        )}

        {/* Rate modal */}
        <AnimatePresence>
          {isRateModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
              onClick={() => setIsRateModalOpen(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md bg-bg-secondary/95 backdrop-blur-md rounded-xl border border-accent/30 shadow-2xl p-6 space-y-4"
              >
                <h2 className="text-lg md:text-xl font-bold glow-text mb-2">
                  {t.rateGame}
                </h2>
                <p className="text-sm text-text-secondary mb-2">
                  {language === 'fa'
                    ? 'به این بازی از ۱ تا ۵ ستاره امتیاز بده.'
                    : 'Rate this game from 1 to 5 stars.'}
                </p>
                <div className="flex justify-center mb-4">
                  <RatingStars
                    value={pendingRating}
                    onChange={(v) => setPendingRating(v)}
                    size="lg"
                  />
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={() => setIsRateModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-accent/40 text-text-secondary hover:bg-bg-tertiary/60 transition-all text-sm"
                  >
                    {t.cancel}
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSubmitRating}
                    className="px-4 py-2 rounded-lg bg-accent text-white font-semibold shadow-lg text-sm"
                  >
                    {t.save}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}


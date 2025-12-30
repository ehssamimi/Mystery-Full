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

// SVG Icons
const HeartIcon = ({ filled }: { filled: boolean }) => (
  <svg
    className={`w-6 h-6 ${filled ? 'fill-red-500 text-red-500' : 'text-text-secondary'}`}
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
    />
  </svg>
);

const ArrowRightIcon = () => (
  <svg
    className="w-6 h-6 text-text-secondary"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M14 5l7 7m0 0l-7 7m7-7H3"
    />
  </svg>
);

const PlayIcon = () => (
  <svg
    className="w-5 h-5"
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M8 5v14l11-7z" />
  </svg>
);

const UsersIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);

const ClockIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

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

  // Handle browser back button in mobile
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isMobile = window.innerWidth < 768;
    if (!isMobile) return;

    // Push a state to history so we can detect back button
    window.history.pushState({ fromGameDetail: true }, '');

    const handlePopState = (event: PopStateEvent) => {
      // If user pressed back, redirect to home
      router.push('/');
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [router]);

  const handleFavorite = async () => {
    if (favorite) {
      await removeFromFavorites(game.id);
    } else {
      await addToFavorites(game.id);
    }
    setFavorite(!favorite);
  };

  const handleBack = () => {
    router.push('/');
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

  return (
    <div className="min-h-screen pb-24">
      {/* Header - Sticky */}
      <div className="sticky top-0 z-10 bg-bg-secondary/80 backdrop-blur-xl border-b border-accent/20">
        <div className="flex items-center justify-between p-4">
          <motion.button
            onClick={handleFavorite}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-xl hover:bg-bg-tertiary/50 transition-colors"
          >
            <HeartIcon filled={favorite} />
          </motion.button>
          <h1 className="text-lg glow-text">
            {language === 'fa' ? game.name : game.nameEn}
          </h1>
          <motion.button
            onClick={handleBack}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-xl hover:bg-bg-tertiary/50 transition-colors"
          >
            <ArrowRightIcon />
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Game Header - کامنت شده */}
        {/* <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-3xl mb-2 glow-text">{game.name}</h2>
          <p className="text-lg text-text-secondary">{game.nameEn}</p>
        </motion.div> */}

        {/* Game Image - حفظ شده در همان جای فعلی */}
        {game.imageUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <div className="relative w-full h-64 md:h-96 rounded-xl overflow-hidden shadow-2xl border border-accent/20">
              <img
                src={game.imageUrl}
                alt={game.name}
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        )}

        {/* Special Message - کامنت شده */}
        {/* <motion.div
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
        </motion.div> */}

        {/* Game Info Cards - کامنت شده */}
        {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
        </div> */}

        {/* Game Meta Info - بازیکن و مدت زمان */}
        <motion.div
          className="flex justify-center gap-8 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-accent mb-1">
              <UsersIcon />
              <span>
                {game.minPlayers === game.maxPlayers
                  ? game.minPlayers
                  : `${game.minPlayers}-${game.maxPlayers}`}
                {language === 'fa' ? ' نفر' : ' players'}
              </span>
            </div>
            <p className="text-xs text-text-secondary">{t.playerCount}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-accent-glow mb-1">
              <ClockIcon />
              <span>
                {game.duration} {t.minutes}
              </span>
            </div>
            <p className="text-xs text-text-secondary">{t.durationLabel}</p>
          </div>
        </motion.div>

        {/* Category Tags */}
        <motion.div
          className="flex justify-center gap-2 flex-wrap mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {game.category.split(/،|,/).map((cat, index) => (
            <span
              key={index}
              className="px-4 py-2 rounded-full bg-accent/20 text-accent text-sm border border-accent/30"
            >
              {cat.trim()}
            </span>
          ))}
        </motion.div>

        {/* Description */}
        <motion.div
          className="card mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-lg mb-3 glow-text">{t.aboutGame}</h3>
          <p className="text-text-secondary leading-relaxed">{game.description}</p>
        </motion.div>

        {/* Rules */}
        <motion.div
          className="card mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-lg mb-4 glow-text">{t.gameRules}</h3>
          <ol className="space-y-3">
            {game.rules.split('\n').filter((rule) => rule.trim()).map((rule, index) => (
              <li key={index} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/30 flex items-center justify-center text-sm border border-accent/30 text-accent">
                  {index + 1}
                </span>
                <span className="text-text-secondary leading-relaxed">{rule.trim()}</span>
              </li>
            ))}
          </ol>
        </motion.div>

        {/* Tips */}
        {game.tips && (
          <motion.div
            className="card mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-lg mb-3 glow-text">{t.importantTips}</h3>
            <p className="text-text-secondary leading-relaxed">{game.tips}</p>
          </motion.div>
        )}

        {/* Actions - کامنت شده */}
        {/* <motion.div
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
        </motion.div> */}

        {/* Average score display */}
        {averageScore != null && (
          <div className="flex flex-col items-center gap-1 text-sm text-text-secondary">
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
      </div>

      {/* Bottom Buttons - Fixed */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-bg-primary via-bg-primary/95 to-transparent z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="space-y-3 max-w-md mx-auto">
          <motion.button
            onClick={() => router.push(`/games/${game.id}/play?players=${playerCount}`)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-accent hover:bg-accent-glow text-white py-5 rounded-2xl shadow-lg shadow-accent/50 transition-all flex items-center justify-center gap-2 font-semibold"
          >
            <PlayIcon />
            <span>{language === 'fa' ? 'بازی کن' : 'Play Game'}</span>
          </motion.button>
          <motion.button
            onClick={() => openRatingModal({ redirectAfter: true })}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-bg-secondary hover:bg-bg-tertiary text-text-primary py-5 rounded-2xl border border-accent/30 transition-all font-semibold"
          >
            {language === 'fa' ? 'برگشت به خانه' : 'Back to Home'}
          </motion.button>
        </div>
      </motion.div>

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
  );
}

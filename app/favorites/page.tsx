'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLanguageStore } from '@/lib/store/language-store';
import { translations } from '@/lib/translations';
import { getFavorites, removeFromFavorites } from '@/lib/storage';
import { Game } from '@/types/game';
// import UserNavbar from '@/components/UserNavbar'; // Removed - only show on home page

export default function FavoritesPage() {
  const { language, isRTL } = useLanguageStore();
  const t = translations[language];
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const ids = await getFavorites();
        setFavoriteIds(ids);

        if (ids.length > 0) {
          const response = await fetch('/api/games');
          const allGames: Game[] = await response.json();
          const favoriteGames = allGames.filter((game) => ids.includes(game.id));
          setGames(favoriteGames);
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, []);

  const handleRemoveFavorite = async (gameId: string) => {
    await removeFromFavorites(gameId);
    setFavoriteIds((prev) => prev.filter((id) => id !== gameId));
    setGames((prev) => prev.filter((game) => game.id !== gameId));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl glow-text">{t.loading}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold glow-text mb-4">
              {t.myFavorites}
            </h1>
            <p className="text-lg text-text-secondary">
              {games.length > 0
                ? `${games.length} ${t.favorites}`
                : t.noFavorites}
            </p>
          </motion.div>

          {/* Games Grid */}
          {games.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-16"
            >
              <div className="text-6xl mb-4">💔</div>
              <h2 className="text-2xl font-bold glow-text mb-4">{t.noFavorites}</h2>
              <Link href="/">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary mt-4"
                >
                  {t.home}
                </motion.button>
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {games.map((game, index) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="card group hover:border-accent/50 transition-all duration-300"
                >
                  <Link href={`/games/${game.id}`}>
                    <div className="p-6">
                      {/* Game Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold glow-text mb-2 group-hover:text-accent transition-colors">
                            {game.name}
                          </h3>
                          <p className="text-sm text-text-secondary">{game.nameEn}</p>
                        </div>
                        <motion.button
                          onClick={(e) => {
                            e.preventDefault();
                            handleRemoveFavorite(game.id);
                          }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 transition-all duration-200"
                          title={t.removeFromFavorites}
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          </svg>
                        </motion.button>
                      </div>

                      {/* Game Info */}
                      <div className="flex flex-wrap gap-3 mb-4">
                        <div className="flex items-center gap-1 text-sm text-text-secondary">
                          <span>👥</span>
                          <span>
                            {game.minPlayers === game.maxPlayers
                              ? game.minPlayers
                              : `${game.minPlayers}-${game.maxPlayers}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-text-secondary">
                          <span>⏱️</span>
                          <span>{game.duration} {t.minutes}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-text-secondary">
                          <span>📊</span>
                          <span>{game.category}</span>
                        </div>
                      </div>

                      {/* Description Preview */}
                      <p className="text-sm text-text-secondary line-clamp-2">
                        {game.description}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
    </div>
  );
}


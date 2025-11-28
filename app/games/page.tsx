'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import GameRoulette from '@/components/GameRoulette';
import UserNavbar from '@/components/UserNavbar';
import { useLanguageStore } from '@/lib/store/language-store';
import { translations } from '@/lib/translations';
import { Game } from '@/types/game';

export default function GamesPage() {
  const searchParams = useSearchParams();
  const playerCount = parseInt(searchParams.get('players') || '2', 10);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguageStore();
  const t = translations[language];

  useEffect(() => {
    // Fetch games from API
    const fetchGames = async () => {
      try {
        const response = await fetch(`/api/games?players=${playerCount}`);
        const data = await response.json();
        
        // Ensure data is an array
        if (Array.isArray(data)) {
          setGames(data);
        } else {
          console.error('Invalid games data format:', data);
          setGames([]);
        }
      } catch (error) {
        console.error('Error fetching games:', error);
        setGames([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [playerCount]);

  if (loading) {
    return (
      <>
        <UserNavbar />
        <div className="min-h-screen flex items-center justify-center pt-20">
          <div className="text-2xl glow-text">{t.loading}</div>
        </div>
      </>
    );
  }

  if (games.length === 0) {
    return (
      <>
        <UserNavbar />
        <div className="min-h-screen flex flex-col items-center justify-center p-4 pt-20">
          <h2 className="text-3xl font-bold glow-text mb-4">
            {t.noGamesForPlayers.replace('{count}', playerCount.toString())}
          </h2>
          <a href="/" className="btn-primary mt-4">
            {t.back}
          </a>
        </div>
      </>
    );
  }

  return (
    <>
      <UserNavbar />
      <GameRoulette games={games} playerCount={playerCount} />
    </>
  );
}


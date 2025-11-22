'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import GameDetails from '@/components/GameDetails';
import UserNavbar from '@/components/UserNavbar';
import { useLanguageStore } from '@/lib/store/language-store';
import { translations } from '@/lib/translations';
import { Game } from '@/types/game';

export default function GameDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const playerCount = parseInt(searchParams.get('players') || '2', 10);
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguageStore();
  const t = translations[language];

  useEffect(() => {
    // Fetch game from API
    const fetchGame = async () => {
      try {
        const response = await fetch('/api/games');
        const games: Game[] = await response.json();
        const foundGame = games.find((g) => g.id === params.id);
        setGame(foundGame || null);
      } catch (error) {
        console.error('Error fetching game:', error);
        setGame(null);
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [params.id]);

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

  if (!game) {
    return (
      <>
        <UserNavbar />
        <div className="min-h-screen flex flex-col items-center justify-center p-4 pt-20">
          <h2 className="text-3xl font-bold glow-text mb-4">{t.noGameFound}</h2>
          <a href="/" className="btn-primary mt-4">
            {t.backToHome}
          </a>
        </div>
      </>
    );
  }

  return (
    <>
      <UserNavbar />
      <GameDetails game={game} playerCount={playerCount} />
    </>
  );
}


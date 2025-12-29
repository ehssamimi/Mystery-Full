'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import GameDetails from '@/components/GameDetails';
// import UserNavbar from '@/components/UserNavbar'; // Removed - only show on home page
import { useLanguageStore } from '@/lib/store/language-store';
import { translations } from '@/lib/translations';
import { Game } from '@/types/game';

export default function GameDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const playerCount = parseInt(searchParams.get('players') || '2', 10);
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [datasets, setDatasets] = useState<any[]>([]);
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

        // دریافت datasets با استفاده از datasetIds
        if (foundGame && foundGame.datasetIds && foundGame.datasetIds.length > 0) {
          try {
            // دریافت اطلاعات کامل هر dataset با استفاده از ID
            const datasetsPromises = foundGame.datasetIds.map(async (datasetId) => {
              const datasetResponse = await fetch(`/api/datasets/${datasetId}`);
              const datasetData = await datasetResponse.json();
              if (datasetData.success && datasetData.dataset) {
                return datasetData.dataset;
              }
              return null;
            });

            const datasets = await Promise.all(datasetsPromises);
            setDatasets(datasets.filter((dataset) => dataset !== null));
          } catch (error) {
            console.error('Error fetching datasets:', error);
            setDatasets([]);
          }
        } else {
          // Fallback: اگر datasetIds موجود نبود، از endpoint قدیمی استفاده کن
          try {
            const datasetsResponse = await fetch(`/api/games/${params.id}/datasets`);
            const datasetsData = await datasetsResponse.json();
            if (datasetsData.success) {
              setDatasets(datasetsData.datasets || []);
            }
          } catch (error) {
            console.error('Error fetching datasets:', error);
            setDatasets([]);
          }
        }
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl glow-text">{t.loading}</div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-3xl font-bold glow-text mb-4">{t.noGameFound}</h2>
        <a href="/" className="btn-primary mt-4">
          {t.backToHome}
        </a>
      </div>
    );
  }

  return <GameDetails game={game} playerCount={playerCount} />;
}


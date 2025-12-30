'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useLanguageStore } from '@/lib/store/language-store';
import { translations } from '@/lib/translations';
import { Game, Dataset } from '@/types/game';
import { motion } from 'framer-motion';
import Flow1Spyfall from '@/components/games/flows/Flow1Spyfall';
import FlowRoulette from '@/components/games/flows/FlowRoulette';
import FlowPantomime from '@/components/games/flows/FlowPantomime';
import GameHub from '@/components/games/GameHub';

const FLOW1_GAME_TYPE_ID = 'cmjnzm9l300002p0ccu7h1wbq';
const ROULETTE_GAME_TYPE_ID = 'cmj1aad680004ld3xvq0mprkx';
const PANTOMIME_GAME_TYPE_ID = 'cmjst1ncf0000plxplszk3ax0';

export default function GamePlayPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const playerCount = parseInt(searchParams.get('players') || '2', 10);
  const [game, setGame] = useState<Game | null>(null);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguageStore();
  const t = translations[language];

  // لیست نمونه سوالات برای تست
  // TODO: می‌توانی این سوالات را از game data یا API بگیر
  // مثال: const questions = game.questions || sampleQuestions;
  // const sampleQuestions = [
  //   'آیا ترجیح می‌دهی یک شب در خانه بمانی یا به مهمانی بروی؟',
  //   'آیا ترجیح می‌دهی پیتزا بخوری یا سوشی؟',
  //   'آیا ترجیح می‌دهی فیلم ببینی یا کتاب بخوانی؟',
  //   'آیا ترجیح می‌دهی به ساحل بروی یا به کوه؟',
  //   'آیا ترجیح می‌دهی صبح زود بیدار شوی یا دیر بخوابی؟',
  //   'آیا ترجیح می‌دهی موسیقی کلاسیک گوش کنی یا راک؟',
  //   'آیا ترجیح می‌دهی قهوه بنوشی یا چای؟',
  //   'آیا ترجیح می‌دهی سفر به اروپا بروی یا آسیا؟',
  //   'آیا ترجیح می‌دهی ورزش کنی یا بازی ویدیویی بازی کنی؟',
  //   'آیا ترجیح می‌دهی حیوان خانگی داشته باشی یا نه؟',
  // ];


  useEffect(() => {
    const fetchGameAndDatasets = async () => {
      try {
        // Fetch game data
        const response = await fetch('/api/games');
        const games: Game[] = await response.json();
        const foundGame = games.find((g) => g.id === params.id);
        setGame(foundGame || null);

        // If game has datasetIds, fetch all datasets
        if (foundGame && foundGame.datasetIds && foundGame.datasetIds.length > 0) {
          try {
            const datasetsPromises = foundGame.datasetIds.map(async (datasetId) => {
              const datasetResponse = await fetch(`/api/datasets/${datasetId}`);
              const datasetData = await datasetResponse.json();
              if (datasetData.success && datasetData.dataset) {
                return datasetData.dataset;
              }
              return null;
            });

            const fetchedDatasets = await Promise.all(datasetsPromises);
            setDatasets(fetchedDatasets.filter((ds) => ds !== null) as Dataset[]);
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

    fetchGameAndDatasets();
  }, [params.id]);

  // جلوگیری از scroll افقی (overflow-x hidden) در موبایل
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isMobile = window.innerWidth < 768;
    if (!isMobile) return;

    // ذخیره مقادیر قبلی
    const originalBodyOverflowX = document.body.style.overflowX;
    const originalHtmlOverflowX = document.documentElement.style.overflowX;
    const originalBodyTouchAction = document.body.style.touchAction;
    const originalHtmlTouchAction = document.documentElement.style.touchAction;

    // غیرفعال کردن scroll افقی
    document.body.style.overflowX = 'hidden';
    document.documentElement.style.overflowX = 'hidden';
    document.body.style.touchAction = 'pan-y';
    document.documentElement.style.touchAction = 'pan-y';

    return () => {
      // بازگرداندن مقادیر قبلی
      document.body.style.overflowX = originalBodyOverflowX;
      document.documentElement.style.overflowX = originalHtmlOverflowX;
      document.body.style.touchAction = originalBodyTouchAction;
      document.documentElement.style.touchAction = originalHtmlTouchAction;
    };
  }, []);

  // Handle back button
  const handleBack = () => {
    router.push(`/games/${params.id}?players=${playerCount}`);
  };


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
        <motion.button
          onClick={() => router.push(`/games/${params.id}?players=${playerCount}`)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-primary mt-4"
        >
          {t.backToHome}
        </motion.button>
      </div>
    );
  }

  // Get gameType ID from game.playtype or game.gameType
  const gameTypeId = game.playtype?.id || game.gameType?.id;

  // Route to appropriate flow based on gameType.id
  if (gameTypeId === FLOW1_GAME_TYPE_ID) {
    return (
      <GameHub onBack={handleBack}>
        <Flow1Spyfall playerCount={playerCount} datasets={datasets} />
      </GameHub>
    );
  }

  // Route to Roulette (Wheel of Fortune) flow
  if (gameTypeId === ROULETTE_GAME_TYPE_ID) {
    return (
      <GameHub onBack={handleBack}>
        <FlowRoulette playerCount={playerCount} datasets={datasets} />
      </GameHub>
    );
  }

  // Route to Pantomime flow
  if (gameTypeId === PANTOMIME_GAME_TYPE_ID) {
    return (
      <GameHub onBack={handleBack}>
        <FlowPantomime playerCount={playerCount} datasets={datasets} />
      </GameHub>
    );
  }

  // Default/Unknown flow - show error or default message
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h2 className="text-3xl font-bold glow-text mb-4">
        {language === 'fa' ? 'نوع بازی پشتیبانی نمی‌شود' : 'Game type not supported'}
      </h2>
      <motion.button
        onClick={handleBack}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="btn-primary mt-4"
      >
        {t.backToHome}
      </motion.button>
    </div>
  );
}



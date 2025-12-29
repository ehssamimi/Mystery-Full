'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Game } from '@/types/game';
import { GameCard } from '../GameCard';
import { useLanguageStore } from '@/lib/store/language-store';
import { translations } from '@/lib/translations';

interface ResultScreenProps {
  game: Game;
  playerCount: number;
  onSkip?: () => void;
  freeSkipsRemaining?: number;
  skipCost?: number;
}

export function ResultScreen({
  game,
  playerCount,
  onSkip,
  freeSkipsRemaining = 0,
  skipCost = 1,
}: ResultScreenProps) {
  const router = useRouter();
  const { language } = useLanguageStore();
  const t = translations[language];
  
  const canSkip = freeSkipsRemaining > 0 || true; // برای حالا همیشه می‌توان skip کرد

  const handlePlay = () => {
    router.push(`/games/${game.id}?players=${playerCount}`);
  };

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col p-6 pb-24">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-bg-primary via-bg-secondary/30 to-bg-primary pointer-events-none" />
      
      {/* Header */}
      <div className="text-center mb-8 pt-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-text-secondary mb-2">{t.gameDecided || 'بازی تصمیم گرفته است'}</p>
          <h1 className="text-2xl glow-text">
            {t.yourRandomGame || 'بازی تصادفی شما'}
          </h1>
        </motion.div>
      </div>

      {/* Game Card */}
      <motion.div
        className="flex-1 flex items-center justify-center mb-8 relative z-10"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, type: 'spring' }}
      >
        <GameCard game={game} variant="result" />
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        className="space-y-3 max-w-md mx-auto w-full relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        {/* Accept/Play Button */}
        <button
          onClick={handlePlay}
          className="w-full btn-primary py-5 rounded-2xl flex items-center justify-center gap-2"
        >
          <span>{t.playGame || 'بازی کن'}</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>

        {/* Skip Button */}
        {onSkip && (
          <>
            <button
              onClick={onSkip}
              disabled={!canSkip}
              className={`w-full py-5 rounded-2xl border-2 transition-all flex items-center justify-center gap-2 ${
                canSkip
                  ? 'bg-bg-secondary/50 border-accent/30 hover:border-accent/50 text-text-primary'
                  : 'bg-bg-primary/50 border-accent/10 text-text-muted cursor-not-allowed'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{t.skipGame || 'رد کردن'}</span>
              {freeSkipsRemaining > 0 ? (
                <span className="mr-2 px-2 py-0.5 bg-green-500/20 text-green-300 rounded-full text-xs border border-green-400/30">
                  {t.skipGameFree || 'رایگان'}
                </span>
              ) : (
                <span className="mr-2 px-2 py-0.5 bg-accent/20 text-accent-glow rounded-full text-xs border border-accent/30 flex items-center gap-1">
                  <span>{skipCost}</span>
                </span>
              )}
            </button>

            {/* Skip info */}
            <p className="text-center text-xs text-text-muted pt-2">
              {freeSkipsRemaining > 0 ? (
                <>{t.freeSkipsRemaining?.replace('{count}', freeSkipsRemaining.toString()) || `شما ${freeSkipsRemaining} رد کردن رایگان دارید`}</>
              ) : (
                <>{t.noFreeSkips || 'رد کردن رایگان ندارید'}</>
              )}
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}


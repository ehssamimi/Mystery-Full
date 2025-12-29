'use client';

import { Game } from '@/types/game';
import { useLanguageStore } from '@/lib/store/language-store';
import { translations } from '@/lib/translations';

interface GameCardProps {
  game: Game;
  variant?: 'result' | 'list';
}

export function GameCard({ game, variant = 'result' }: GameCardProps) {
  const { language } = useLanguageStore();
  const t = translations[language];

  if (variant === 'result') {
    return (
      <div className="relative w-full">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-accent-glow/20 to-accent-bright/20 blur-2xl" />
        
        {/* Card */}
        <div className="relative bg-gradient-to-br from-bg-secondary/90 to-bg-primary/90 backdrop-blur-xl rounded-3xl p-8 border border-accent/30 shadow-2xl">
          {/* Title */}
          <h2 className="text-3xl text-center mb-4 glow-text">
            {game.name}
          </h2>

          {/* Description */}
          <p className="text-text-secondary text-center mb-6 leading-relaxed">
            {game.description}
          </p>

          {/* Meta info */}
          <div className="flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-accent-glow">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span>
                {game.minPlayers === game.maxPlayers
                  ? game.minPlayers
                  : `${game.minPlayers}-${game.maxPlayers}`}
              </span>
            </div>
            <div className="flex items-center gap-2 text-accent-bright">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{game.duration} {t.minutes || 'دقیقه'}</span>
            </div>
          </div>

          {/* Category */}
          {game.category && (
            <div className="flex justify-center gap-2 mt-4 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-accent/20 text-accent-glow text-xs border border-accent/30">
                {game.category}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // List variant for favorites/history
  return (
    <div className="bg-gradient-to-br from-bg-secondary/50 to-bg-primary/50 backdrop-blur-xl rounded-2xl p-4 border border-accent/30 hover:border-accent/50 transition-all">
      <div className="flex gap-4">
        <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-accent/20 to-accent-glow/20 rounded-xl flex-shrink-0">
          <span className="text-4xl">🎮</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg mb-1 glow-text truncate">
            {game.name}
          </h3>
          <p className="text-text-secondary text-sm truncate mb-2">{game.description}</p>
          <div className="flex gap-4 text-xs text-text-muted">
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span>
                {game.minPlayers === game.maxPlayers
                  ? game.minPlayers
                  : `${game.minPlayers}-${game.maxPlayers}`}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{game.duration}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


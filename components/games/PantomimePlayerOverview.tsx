'use client';

import { motion } from 'framer-motion';
import { useLanguageStore } from '@/lib/store/language-store';
import { translations } from '@/lib/translations';

interface Player {
  name: string;
  team: 'A' | 'B';
  score: number;
  skipsRemaining: number;
  words: string[];
}

interface PantomimePlayerOverviewProps {
  players: Player[];
  currentPlayerIndex: number;
  teamAScore: number;
  teamBScore: number;
  onStartGame: () => void;
}

// Team A = Green, Team B = Purple
const TEAM_A_COLOR = '#10B981'; // Green
const TEAM_B_COLOR = '#8B5CF6'; // Purple

export default function PantomimePlayerOverview({
  players,
  currentPlayerIndex,
  teamAScore,
  teamBScore,
  onStartGame,
}: PantomimePlayerOverviewProps) {
  const { language } = useLanguageStore();
  const t = translations[language];

  return (
    <div className="min-h-screen flex flex-col px-4 py-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-4"
      >
        <h1 className="text-2xl md:text-3xl font-bold glow-text mb-2">
          {t.playerOverview || 'Player Overview'}
        </h1>
      </motion.div>

      {/* Players List - No scroll by default */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex-1 mb-4"
      >
        <div className="bg-bg-secondary/50 backdrop-blur-sm rounded-2xl p-3 border border-accent/30">
          <div className="space-y-2">
            {players.map((player, index) => {
              const isActive = index === currentPlayerIndex;
              const teamColor = player.team === 'A' ? TEAM_A_COLOR : TEAM_B_COLOR;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ 
                    opacity: isActive ? 1 : 0.3,
                    x: 0,
                    scale: isActive ? 1.02 : 0.98,
                  }}
                  transition={{ delay: index * 0.05 }}
                  className={`
                    relative p-3 rounded-xl border-2 transition-all
                    ${isActive ? 'glow-lg' : ''}
                  `}
                  style={{
                    borderColor: isActive ? teamColor : `${teamColor}30`,
                    backgroundColor: isActive ? `${teamColor}25` : `${teamColor}08`,
                    boxShadow: isActive 
                      ? `0 0 25px ${teamColor}60, 0 4px 12px rgba(0,0,0,0.3)` 
                      : 'none',
                    transform: isActive ? 'scale(1.02)' : 'scale(0.98)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {/* Team Indicator */}
                      <div
                        className={`w-3 h-3 rounded-full transition-all ${
                          isActive ? 'ring-2 ring-offset-2' : ''
                        }`}
                        style={{ 
                          backgroundColor: teamColor,
                        }}
                      />
                      
                      {/* Player Name - Reduced height */}
                      <div className="flex-1">
                        <h3 className={`font-bold text-text-primary transition-all ${
                          isActive ? 'text-base md:text-lg' : 'text-sm md:text-base'
                        }`}>
                          {player.name}
                        </h3>
                        <p className={`text-text-secondary ${
                          isActive ? 'text-xs' : 'text-[10px] opacity-60'
                        }`}>
                          {player.team === 'A' ? t.teamA : t.teamB}
                        </p>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-right">
                      <p 
                        className={`font-bold transition-all ${
                          isActive ? 'text-xl md:text-2xl' : 'text-base md:text-lg opacity-50'
                        }`}
                        style={{ color: teamColor }}
                      >
                        {player.score}
                      </p>
                      <p className={`text-text-secondary ${
                        isActive ? 'text-[10px]' : 'text-[8px] opacity-40'
                      }`}>
                        {t.currentScore || 'Score'}
                      </p>
                    </div>
                  </div>

                  {/* Active Indicator - More prominent */}
                  {isActive && (
                    <motion.div
                      className="absolute top-1 right-1 w-4 h-4 rounded-full"
                      style={{ backgroundColor: teamColor }}
                      animate={{ 
                        scale: [1, 1.3, 1],
                        opacity: [1, 0.8, 1],
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                  
                  {/* Active glow effect */}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-xl pointer-events-none"
                      style={{
                        background: `radial-gradient(circle at center, ${teamColor}20 0%, transparent 70%)`,
                      }}
                      animate={{
                        opacity: [0.5, 0.8, 0.5],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Team Score Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-4"
      >
        <div className="grid grid-cols-2 gap-3">
          {/* Team A Score - Green */}
          <motion.div
            className="p-4 rounded-xl border-2"
            style={{
              borderColor: TEAM_A_COLOR,
              backgroundColor: `${TEAM_A_COLOR}20`,
            }}
            whileHover={{ scale: 1.02 }}
          >
            <h3 className="text-base font-bold mb-1" style={{ color: TEAM_A_COLOR }}>
              {t.teamA || 'Team A'}
            </h3>
            <p className="text-3xl font-bold" style={{ color: TEAM_A_COLOR }}>
              {teamAScore}
            </p>
          </motion.div>

          {/* Team B Score - Purple */}
          <motion.div
            className="p-4 rounded-xl border-2"
            style={{
              borderColor: TEAM_B_COLOR,
              backgroundColor: `${TEAM_B_COLOR}20`,
            }}
            whileHover={{ scale: 1.02 }}
          >
            <h3 className="text-base font-bold mb-1" style={{ color: TEAM_B_COLOR }}>
              {t.teamB || 'Team B'}
            </h3>
            <p className="text-3xl font-bold" style={{ color: TEAM_B_COLOR }}>
              {teamBScore}
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Start Game Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex justify-center"
      >
        <motion.button
          onClick={onStartGame}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="btn-primary glow-lg px-8 py-4 text-lg font-semibold"
        >
          {t.startGame || 'Start Game'}
        </motion.button>
      </motion.div>
    </div>
  );
}

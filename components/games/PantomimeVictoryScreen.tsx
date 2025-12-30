'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useLanguageStore } from '@/lib/store/language-store';
import { translations } from '@/lib/translations';

interface PantomimeVictoryScreenProps {
  winner: 'A' | 'B' | null;
  teamAScore: number;
  teamBScore: number;
  onTryAgain: () => void;
}

// Colorful paper-like colors
const PARTICLE_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Cyan
  '#45B7D1', // Blue
  '#FFA07A', // Light Salmon
  '#98D8C8', // Mint
  '#F7DC6F', // Yellow
  '#BB8FCE', // Purple
  '#85C1E2', // Sky Blue
  '#F8B88B', // Peach
  '#A8E6CF', // Light Green
  '#FFD93D', // Gold
  '#6BCF7F', // Green
];

const TEAM_A_COLOR = '#4ECDC4';
const TEAM_B_COLOR = '#6BCF7F';

export default function PantomimeVictoryScreen({
  winner,
  teamAScore,
  teamBScore,
  onTryAgain,
}: PantomimeVictoryScreenProps) {
  const { language } = useLanguageStore();
  const t = translations[language];
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number; color: string; rotation: number }>>([]);

  useEffect(() => {
    // Generate random particles with colors
    const newParticles = Array.from({ length: 80 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 0.8,
      color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
      rotation: Math.random() * 360,
    }));
    setParticles(newParticles);
  }, []);

  const winnerTeam = winner === 'A' ? t.teamA : winner === 'B' ? t.teamB : null;
  const winnerColor = winner === 'A' ? TEAM_A_COLOR : winner === 'B' ? TEAM_B_COLOR : '#6c5ce7';

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      {/* Explosion Circle */}
      <motion.div
        className="absolute w-96 h-96 rounded-full"
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: 4, opacity: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{
          background: `radial-gradient(circle, ${winnerColor}80 0%, transparent 70%)`,
        }}
      />

      {/* Colorful Particles */}
      {particles.map((particle) => {
        const angle = Math.random() * Math.PI * 2;
        const distance = 200 + Math.random() * 400;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        return (
          <motion.div
            key={particle.id}
            className="absolute pointer-events-none"
            style={{
              width: '12px',
              height: '12px',
              backgroundColor: particle.color,
              boxShadow: `0 0 10px ${particle.color}`,
              left: '50%',
              top: '50%',
              borderRadius: '2px',
            }}
            initial={{ 
              x: 0, 
              y: 0, 
              scale: 1, 
              opacity: 1,
              rotate: particle.rotation,
            }}
            animate={{
              x,
              y,
              scale: [1, 1.5, 0],
              opacity: [1, 1, 0],
              rotate: particle.rotation + 360,
            }}
            transition={{
              duration: 1.2,
              delay: particle.delay,
              ease: 'easeOut',
            }}
          />
        );
      })}

      {/* Victory Content */}
      <motion.div
        className="relative z-10 text-center pointer-events-auto"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5, type: 'spring', stiffness: 200 }}
      >
        <motion.h2
          className="text-5xl md:text-7xl font-bold mb-4"
          style={{ color: winnerColor }}
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 0.5,
            repeat: 2,
          }}
        >
          {winner ? (t.teamWins || '{team} Wins!').replace('{team}', winnerTeam || '') : t.tie || 'Tie!'}
        </motion.h2>

        {/* Scores */}
        <motion.div
          className="flex gap-8 justify-center mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="text-center">
            <p className="text-lg text-text-secondary mb-2">{t.teamA || 'Team A'}</p>
            <p className="text-3xl font-bold" style={{ color: TEAM_A_COLOR }}>
              {teamAScore}
            </p>
          </div>
          <div className="text-center">
            <p className="text-lg text-text-secondary mb-2">{t.teamB || 'Team B'}</p>
            <p className="text-3xl font-bold" style={{ color: TEAM_B_COLOR }}>
              {teamBScore}
            </p>
          </div>
        </motion.div>

        {/* Try Again Button */}
        <motion.button
          onClick={onTryAgain}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-4 bg-accent hover:bg-accent-glow text-white rounded-xl font-semibold glow-lg transition-all"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          {t.tryAgain || 'Try Again'}
        </motion.button>
      </motion.div>
    </div>
  );
}


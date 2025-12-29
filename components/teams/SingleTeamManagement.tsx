'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTeamMembers, saveTeamMembers } from '@/lib/storage';
import { useLanguageStore } from '@/lib/store/language-store';
import { translations } from '@/lib/translations';

interface SingleTeamManagementProps {
  playerCount: number;
  onComplete?: (players: string[]) => void;
  showNextButton?: boolean;
  nextButtonText?: string;
}

export default function SingleTeamManagement({
  playerCount,
  onComplete,
  showNextButton = true,
  nextButtonText,
}: SingleTeamManagementProps) {
  const { isRTL, language } = useLanguageStore();
  const t = translations[language];
  const buttonText = nextButtonText || t.nextStage;
  const [players, setPlayers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load team members from localStorage on mount
  useEffect(() => {
    const loadTeamMembers = () => {
      const savedData = getTeamMembers();

      if (savedData && savedData.teamMembers.length > 0) {
        // Smart fill: use previous players up to current playerCount
        const savedPlayers = savedData.teamMembers.filter((name) => name.trim() !== '');
        const newPlayers = savedPlayers.slice(0, playerCount);
        
        // Fill remaining slots with empty strings
        while (newPlayers.length < playerCount) {
          newPlayers.push('');
        }
        
        setPlayers(newPlayers);
      } else {
        // Initialize with default names: "پلیر 1", "پلیر 2", etc.
        const defaultPlayers = Array.from({ length: playerCount }, (_, i) => {
          return t.playerWithNumber.replace('{number}', String(i + 1));
        });
        setPlayers(defaultPlayers);
      }

      setIsLoading(false);
    };

    loadTeamMembers();
  }, [playerCount, language]);

  // Auto-save to localStorage whenever players change
  useEffect(() => {
    if (isLoading) return;

    // Save as single team (teamB = undefined)
    saveTeamMembers(players, playerCount, players, undefined);
  }, [players, playerCount, isLoading]);

  // Handle adding a new player slot
  const handleAddPlayer = () => {
    const newPlayerName = t.playerWithNumber.replace('{number}', String(players.length + 1));
    setPlayers([...players, newPlayerName]);
  };

  // Handle removing a player
  const handleRemovePlayer = (index: number) => {
    const newPlayers = players.filter((_, i) => i !== index);
    setPlayers(newPlayers);
  };

  // Handle player name change
  const handleNameChange = (index: number, value: string) => {
    const newPlayers = [...players];
    newPlayers[index] = value;
    setPlayers(newPlayers);
  };

  // Handle clear text for a player
  const handleClearPlayer = (index: number) => {
    const newPlayers = [...players];
    newPlayers[index] = '';
    setPlayers(newPlayers);
  };

  // Handle continue button
  const handleContinue = () => {
    const filteredPlayers = players.filter((name) => name.trim() !== '');

    if (onComplete && filteredPlayers.length > 0) {
      onComplete(filteredPlayers);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-xl text-text-secondary">در حال بارگذاری...</div>
      </div>
    );
  }

  const hasValidPlayers = players.some((name) => name.trim() !== '');

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl md:text-4xl font-bold glow-text mb-2">{t.formTeam}</h2>
        <p className="text-text-secondary text-lg">
          {playerCount} {t.players}
        </p>
      </motion.div>

      {/* Players List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
        className="mb-8"
      >
        <div
          className="rounded-2xl p-6 border-2 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(108, 92, 231, 0.1), rgba(162, 155, 254, 0.05))',
            borderColor: '#6c5ce7',
            boxShadow: '0 0 30px rgba(108, 92, 231, 0.3), inset 0 0 30px rgba(108, 92, 231, 0.1)',
          }}
        >
          {/* Players List */}
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {players.map((name, index) => (
                <motion.div
                  key={`player-${index}`}
                  initial={{ opacity: 0, scale: 0.9, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => handleNameChange(index, e.target.value)}
                    placeholder={t.playerWithNumber.replace('{number}', String(index + 1))}
                    className="flex-1 px-4 py-2 bg-bg-tertiary border border-accent/30 rounded-lg text-text-primary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                    style={{
                      boxShadow: name.trim() ? '0 0 10px rgba(108, 92, 231, 0.2)' : 'none',
                    }}
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleClearPlayer(index)}
                    className="w-10 h-10 rounded-lg bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 flex items-center justify-center hover:bg-yellow-500/30 transition-all"
                    aria-label={t.clearText}
                    title={t.clearText}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleRemovePlayer(index)}
                    className="w-10 h-10 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 flex items-center justify-center hover:bg-red-500/30 transition-all"
                    aria-label={t.removePlayer}
                    title={t.removePlayer}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Add Player Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddPlayer}
              className="w-full py-3 rounded-lg border-2 border-dashed border-accent/50 text-accent-glow flex items-center justify-center gap-2 hover:border-accent hover:bg-accent/10 transition-all"
              style={{
                boxShadow: '0 0 15px rgba(108, 92, 231, 0.2)',
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="font-medium">{t.addPlayer}</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Next Button */}
      {showNextButton && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.3 }}
          className="flex justify-center mt-8"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleContinue}
            disabled={!hasValidPlayers}
            className="btn-primary glow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:y-0 px-8 py-4 text-lg"
          >
            {buttonText}
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}


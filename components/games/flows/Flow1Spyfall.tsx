'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguageStore } from '@/lib/store/language-store';
import { translations } from '@/lib/translations';
import { Dataset } from '@/types/game';
import SingleTeamManagement from '@/components/teams/SingleTeamManagement';
import PeelRevealCards from '@/components/games/PeelRevealCards';
import GameTimer from '@/components/games/GameTimer';

interface Flow1SpyfallProps {
  playerCount: number;
  datasets: Dataset[];
  onBack?: () => void;
}

type Stage = 'team' | 'cards' | 'timer';

export default function Flow1Spyfall({ playerCount, datasets, onBack }: Flow1SpyfallProps) {
  const { language } = useLanguageStore();
  const t = translations[language];
  const [stage, setStage] = useState<Stage>('team');
  const [players, setPlayers] = useState<string[]>([]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [spyIndex, setSpyIndex] = useState<number>(-1);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [timerEnded, setTimerEnded] = useState(false);
  const [timerKey, setTimerKey] = useState(0); // Key to force timer reset
  const [cardRevealed, setCardRevealed] = useState(false);

  // Get all items from all datasets
  const getAllItems = (): string[] => {
    const allItems: string[] = [];
    datasets.forEach((dataset) => {
      dataset.items.forEach((item) => {
        // Use nameFa for Persian, nameEn for English
        allItems.push(language === 'fa' ? item.nameFa : item.nameEn);
      });
    });
    return allItems;
  };

  // Select random word and spy when entering cards stage
  useEffect(() => {
    if (stage === 'cards' && players.length > 0) {
      const allItems = getAllItems();
      if (allItems.length > 0) {
        // Select random word
        const randomWord = allItems[Math.floor(Math.random() * allItems.length)];
        setSelectedWord(randomWord);

        // Select random spy
        const randomSpyIndex = Math.floor(Math.random() * players.length);
        setSpyIndex(randomSpyIndex);
        setCurrentPlayerIndex(0);
        setCardRevealed(false); // Reset card revealed state for new round
      }
    }
  }, [stage, players.length, datasets, language]);

  // Reset cardRevealed when player changes
  useEffect(() => {
    if (stage === 'cards') {
      setCardRevealed(false);
    }
  }, [currentPlayerIndex, stage]);

  // Handle team complete
  const handleTeamComplete = (teamPlayers: string[]) => {
    setPlayers(teamPlayers);
    setStage('cards');
  };

  // Handle card reveal
  const handleCardReveal = () => {
    setCardRevealed(true);
  };

  // Handle next player in cards stage
  const handleNextPlayer = () => {
    if (!cardRevealed) return; // Don't proceed if card hasn't been revealed
    
    if (currentPlayerIndex < players.length - 1) {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
    } else {
      // Last player - go to timer stage
      setStage('timer');
      setIsTimerRunning(true);
      setTimerEnded(false);
    }
  };

  // Handle timer stop
  const handleTimerStop = () => {
    setIsTimerRunning(false);
  };

  // Handle timer resume
  const handleTimerResume = () => {
    setIsTimerRunning(true);
  };

  // Handle timer complete
  const handleTimerComplete = () => {
    setIsTimerRunning(false);
    setTimerEnded(true);
  };

  // Handle try again - reset to cards stage with new random word
  const handleTryAgain = () => {
    setStage('cards');
    setCurrentPlayerIndex(0);
    setIsTimerRunning(true);
    setTimerEnded(false);
    setTimerKey((prev) => prev + 1); // Force timer reset
    // Reset word and spy selection will happen in useEffect when stage changes
  };

  // Get current player's card text
  const getCurrentPlayerCardText = () => {
    if (currentPlayerIndex === spyIndex) {
      return t.youAreTheSpy;
    }
    return selectedWord || '';
  };

  const isLastPlayer = currentPlayerIndex === players.length - 1;

  return (
    <div className="min-h-screen p-4 md:p-8 relative z-10 animated-bg">
      <div className="max-w-7xl mx-auto">
        {/* Back Button - Always visible */}
        {onBack && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={onBack}
            className="mb-6 p-2 hover:bg-bg-secondary rounded-lg transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </motion.button>
        )}

        {/* Stage 1: Team Formation */}
        {stage === 'team' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <SingleTeamManagement
              playerCount={playerCount}
              onComplete={handleTeamComplete}
              showNextButton={true}
            />
          </motion.div>
        )}

        {/* Stage 2: Card Reveal */}
        {stage === 'cards' && selectedWord && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center"
          >
            {/* Current Player Name */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h2 className="text-3xl md:text-4xl font-bold glow-text mb-2">
                {players[currentPlayerIndex] || t.playerWithNumber.replace('{number}', String(currentPlayerIndex + 1))}
              </h2>
              <p className="text-text-secondary text-lg">
                {currentPlayerIndex + 1} / {players.length}
              </p>
            </motion.div>

            {/* Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <PeelRevealCards
                frontText={players[currentPlayerIndex] || t.playerWithNumber.replace('{number}', String(currentPlayerIndex + 1))}
                backText={getCurrentPlayerCardText()}
                onReveal={handleCardReveal}
                isRevealed={cardRevealed}
              />
            </motion.div>

            {/* Next Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <motion.button
                whileHover={cardRevealed ? { scale: 1.05, y: -2 } : {}}
                whileTap={cardRevealed ? { scale: 0.95 } : {}}
                onClick={handleNextPlayer}
                disabled={!cardRevealed}
                className={`px-8 py-4 text-lg rounded-xl font-semibold transition-all ${
                  cardRevealed
                    ? 'btn-primary glow-lg cursor-pointer'
                    : 'bg-bg-secondary border border-accent/30 text-text-secondary/50 cursor-not-allowed opacity-60'
                }`}
              >
                {!cardRevealed
                  ? t.dragCardUp
                  : isLastPlayer
                  ? t.startGame
                  : t.nextPlayer}
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {/* Stage 3: Timer */}
        {stage === 'timer' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center"
          >
            <GameTimer
              key={timerKey}
              initialSeconds={180}
              onComplete={handleTimerComplete}
              isRunning={isTimerRunning && !timerEnded}
              onStop={handleTimerStop}
              onResume={handleTimerResume}
            />

            {/* Control Buttons */}
            <div className="flex gap-4 mt-8">
              {timerEnded ? (
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleTryAgain}
                  className="btn-primary px-8 py-4 text-lg"
                >
                  {t.tryAgain}
                </motion.button>
              ) : !isTimerRunning ? (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleTimerResume}
                    className="btn-primary px-8 py-4 text-lg"
                  >
                    <span className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      {t.resume}
                    </span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleTryAgain}
                    className="px-8 py-4 text-lg bg-bg-secondary border border-accent/30 rounded-xl hover:bg-bg-tertiary transition-all"
                  >
                    {t.tryAgain}
                  </motion.button>
                </>
              ) : null}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}


'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useLanguageStore } from '@/lib/store/language-store';
import { translations } from '@/lib/translations';
import { Dataset } from '@/types/game';
import TeamManagement from '@/components/teams/TeamManagement';
import PantomimePlayerOverview from '@/components/games/PantomimePlayerOverview';
import PantomimeCardSwiper from '@/components/games/PantomimeCardSwiper';
import PantomimeVictoryScreen from '@/components/games/PantomimeVictoryScreen';
import { PANTOMIME_CONFIG } from '@/lib/config/pantomime-game';

interface FlowPantomimeProps {
  playerCount: number;
  datasets: Dataset[];
}

type Stage = 'team' | 'overview' | 'playing' | 'finished';

interface Player {
  name: string;
  team: 'A' | 'B';
  score: number;
  skipsRemaining: number;
  words: string[];
}

export default function FlowPantomime({ playerCount, datasets }: FlowPantomimeProps) {
  const { language } = useLanguageStore();
  const t = translations[language];
  const [stage, setStage] = useState<Stage>('team');
  const [teamA, setTeamA] = useState<string[]>([]);
  const [teamB, setTeamB] = useState<string[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Get all items from datasets
  const allItems = useMemo(() => {
    const items: string[] = [];
    datasets.forEach((dataset) => {
      dataset.items.forEach((item) => {
        items.push(language === 'fa' ? item.nameFa : item.nameEn);
      });
    });
    return items;
  }, [datasets, language]);

  // Get random words from dataset
  const getRandomWords = useCallback((count: number): string[] => {
    if (allItems.length === 0) return [];
    const shuffled = [...allItems].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }, [allItems]);

  // Handle team formation complete
  const handleTeamComplete = (newTeamA: string[], newTeamB: string[]) => {
    setTeamA(newTeamA);
    setTeamB(newTeamB);
    
    // Create interleaved player list: [A[0], B[0], A[1], B[1], ...]
    const maxLength = Math.max(newTeamA.length, newTeamB.length);
    const interleavedPlayers: Player[] = [];
    
    for (let i = 0; i < maxLength; i++) {
      if (i < newTeamA.length && newTeamA[i].trim()) {
        // Select random words for this player
        const playerWords = getRandomWords(PANTOMIME_CONFIG.WORDS_PER_PLAYER);
        interleavedPlayers.push({
          name: newTeamA[i],
          team: 'A',
          score: 0,
          skipsRemaining: PANTOMIME_CONFIG.MAX_SKIPS,
          words: playerWords,
        });
      }
      if (i < newTeamB.length && newTeamB[i].trim()) {
        const playerWords = getRandomWords(PANTOMIME_CONFIG.WORDS_PER_PLAYER);
        interleavedPlayers.push({
          name: newTeamB[i],
          team: 'B',
          score: 0,
          skipsRemaining: PANTOMIME_CONFIG.MAX_SKIPS,
          words: playerWords,
        });
      }
    }
    
    setPlayers(interleavedPlayers);
    setCurrentPlayerIndex(0);
    setStage('overview');
  };

  // Handle start game from overview
  const handleStartGame = () => {
    setStage('playing');
    setIsPaused(false);
  };

  // Handle score update during play
  // delta: +1 for correct, -1 for wrong
  // Example: 3 correct (+3) and 1 wrong (-1) = total score of 2
  const handleScoreUpdate = (delta: number) => {
    setPlayers((prev) => {
      const updated = [...prev];
      const currentPlayer = updated[currentPlayerIndex];
      if (currentPlayer) {
        // Update score: correct adds +1, wrong subtracts -1
        // Math.max(0, ...) ensures score never goes below 0
        currentPlayer.score = Math.max(0, currentPlayer.score + delta);
      }
      return updated;
    });
  };

  // Handle skip
  const handleSkip = () => {
    setPlayers((prev) => {
      const updated = [...prev];
      const currentPlayer = updated[currentPlayerIndex];
      if (currentPlayer && currentPlayer.skipsRemaining > 0) {
        currentPlayer.skipsRemaining -= 1;
      }
      return updated;
    });
  };

  // Handle turn complete (time finished or all cards done)
  const handleTurnComplete = () => {
    // Check if game is finished
    const teamAScore = players
      .filter((p) => p.team === 'A')
      .reduce((sum, p) => sum + p.score, 0);
    const teamBScore = players
      .filter((p) => p.team === 'B')
      .reduce((sum, p) => sum + p.score, 0);

    // Check win conditions
    if (
      teamAScore >= PANTOMIME_CONFIG.TARGET_SCORE ||
      teamBScore >= PANTOMIME_CONFIG.TARGET_SCORE ||
      currentPlayerIndex >= players.length - 1
    ) {
      setStage('finished');
      return;
    }

    // Move to next player
    setCurrentPlayerIndex((prev) => prev + 1);
    setStage('overview');
  };

  // Handle try again
  const handleTryAgain = () => {
    setStage('team');
    setCurrentPlayerIndex(0);
    setPlayers([]);
    setTeamA([]);
    setTeamB([]);
  };

  // Get current player
  const currentPlayer = players[currentPlayerIndex] || null;

  // Get team scores
  const teamAScore = useMemo(() => {
    return players.filter((p) => p.team === 'A').reduce((sum, p) => sum + p.score, 0);
  }, [players]);

  const teamBScore = useMemo(() => {
    return players.filter((p) => p.team === 'B').reduce((sum, p) => sum + p.score, 0);
  }, [players]);

  // Determine winner
  const winner = useMemo(() => {
    if (teamAScore > teamBScore) return 'A';
    if (teamBScore > teamAScore) return 'B';
    return null; // Tie
  }, [teamAScore, teamBScore]);

  return (
    <div className="min-h-screen p-4 md:p-8 relative z-10 animated-bg">
      <div className="max-w-7xl mx-auto">
        {/* Stage 1: Team Formation */}
        {stage === 'team' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <TeamManagement
              playerCount={playerCount}
              onComplete={handleTeamComplete}
              showStartButton={true}
              startButtonText={t.nextStage}
            />
          </motion.div>
        )}

        {/* Stage 2: Player Overview */}
        {stage === 'overview' && (
          <PantomimePlayerOverview
            players={players}
            currentPlayerIndex={currentPlayerIndex}
            teamAScore={teamAScore}
            teamBScore={teamBScore}
            onStartGame={handleStartGame}
          />
        )}

        {/* Stage 3: Playing */}
        {stage === 'playing' && currentPlayer && (
          <PantomimeCardSwiper
            player={currentPlayer}
            onScoreUpdate={handleScoreUpdate}
            onSkip={handleSkip}
            onTurnComplete={handleTurnComplete}
            isPaused={isPaused}
            onPauseToggle={() => setIsPaused(!isPaused)}
          />
        )}

        {/* Stage 4: Victory Screen */}
        {stage === 'finished' && (
          <PantomimeVictoryScreen
            winner={winner}
            teamAScore={teamAScore}
            teamBScore={teamBScore}
            onTryAgain={handleTryAgain}
          />
        )}
      </div>
    </div>
  );
}


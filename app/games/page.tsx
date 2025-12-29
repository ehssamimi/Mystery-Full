'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
// import GameRoulette from '@/components/GameRoulette'; // Commented out - using new flow
// import UserNavbar from '@/components/UserNavbar'; // Removed - only show on home page
import { useLanguageStore } from '@/lib/store/language-store';
import { translations } from '@/lib/translations';
import { Game } from '@/types/game';
import { RandomGeneratorScreen } from '@/components/screens/RandomGeneratorScreen';
import { ResultScreen } from '@/components/screens/ResultScreen';
import { selectRandomGameByWeight } from '@/lib/utils/game-selection';

type Screen = 'generating' | 'result';

export default function GamesPage() {
  const searchParams = useSearchParams();
  const playerCount = parseInt(searchParams.get('players') || '2', 10);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<Screen>('generating');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const gamesRef = useRef<Game[]>([]);
  const loadingRef = useRef(true);
  const { language } = useLanguageStore();
  const t = translations[language];

  // Update refs when state changes
  useEffect(() => {
    gamesRef.current = games;
    loadingRef.current = loading;
  }, [games, loading]);

  useEffect(() => {
    // Start generating screen immediately - no loading screen
    setCurrentScreen('generating');
    
    // Fetch games from API
    const fetchGames = async () => {
      try {
        const response = await fetch(`/api/games?players=${playerCount}`);
        const data = await response.json();
        
        // Ensure data is an array
        if (Array.isArray(data) && data.length > 0) {
          setGames(data);
          setLoading(false);
        } else {
          console.error('Invalid games data format or no games:', data);
          setGames([]);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching games:', error);
        setGames([]);
        setLoading(false);
      }
    };

    fetchGames();
  }, [playerCount]);

  // Handle completion of RandomGeneratorScreen
  const handleGenerationComplete = () => {
    // Wait for games to load if still loading
    if (loadingRef.current || gamesRef.current.length === 0) {
      // If still loading, wait a bit and try again
      const checkInterval = setInterval(() => {
        if (!loadingRef.current && gamesRef.current.length > 0) {
          clearInterval(checkInterval);
          selectGame();
        }
      }, 100);
      
      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        if (gamesRef.current.length > 0) {
          selectGame();
        } else {
          // No games available - show error
          setCurrentScreen('generating');
        }
      }, 5000);
    } else {
      selectGame();
    }
  };

  // Select game function
  const selectGame = () => {
    // Use current games from ref to avoid stale closure
    const currentGames = gamesRef.current.length > 0 ? gamesRef.current : games;
    
    // Select random game based on weight
    const randomGame = selectRandomGameByWeight(currentGames);
    if (randomGame) {
      setSelectedGame(randomGame);
      setCurrentScreen('result');
    } else {
      // Fallback: if no game selected, try again or show error
      if (currentGames.length > 0) {
        // Try selecting first game as fallback
        setSelectedGame(currentGames[0]);
        setCurrentScreen('result');
      } else {
        // No games available - restart generating
        setCurrentScreen('generating');
      }
    }
  };

  // Handle skip
  const handleSkip = () => {
    // Reset to generating screen
    setCurrentScreen('generating');
    setSelectedGame(null);
  };

  // Show error if no games found after loading
  if (!loading && games.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-3xl font-bold glow-text mb-4">
          {t.noGamesForPlayers.replace('{count}', playerCount.toString())}
        </h2>
        <a href="/" className="btn-primary mt-4">
          {t.back}
        </a>
      </div>
    );
  }

  return (
    <>
      {currentScreen === 'generating' && (
        <RandomGeneratorScreen onComplete={handleGenerationComplete} />
      )}
      {currentScreen === 'result' && selectedGame ? (
        <ResultScreen
          game={selectedGame}
          playerCount={playerCount}
          onSkip={handleSkip}
        />
      ) : currentScreen === 'result' && !selectedGame ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-2xl glow-text">{t.error || 'خطا'}</div>
        </div>
      ) : null}
      {/* Old GameRoulette component - commented out */}
      {/* <GameRoulette games={games} playerCount={playerCount} /> */}
    </>
  );
}


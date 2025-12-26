'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTeamMembers, saveTeamMembers, TeamMembersData } from '@/lib/storage';
import { useLanguageStore } from '@/lib/store/language-store';

interface TeamManagementProps {
  playerCount: number;
  onComplete?: (teamA: string[], teamB: string[]) => void;
  showStartButton?: boolean;
  startButtonText?: string;
}

export default function TeamManagement({ 
  playerCount, 
  onComplete,
  showStartButton = true,
  startButtonText = 'شروع بازی'
}: TeamManagementProps) {
  const { isRTL } = useLanguageStore();
  const [teamA, setTeamA] = useState<string[]>([]);
  const [teamB, setTeamB] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load team members from localStorage on mount
  useEffect(() => {
    const loadTeamMembers = () => {
      const savedData = getTeamMembers();
      
      if (savedData && savedData.teamMembers.length > 0) {
        // If we have saved team structure, try to preserve it
        if (savedData.teamA && savedData.teamB) {
          const prevTeamA = savedData.teamA.filter(name => name.trim() !== '');
          const prevTeamB = savedData.teamB.filter(name => name.trim() !== '');
          
          // Smart fill: keep first N players, preserving team structure
          // Take players from Team A first, then Team B
          const half = Math.ceil(playerCount / 2);
          let newTeamA: string[] = [];
          let newTeamB: string[] = [];
          
          // Fill Team A (up to half)
          const teamACount = Math.min(prevTeamA.length, half);
          newTeamA = [...prevTeamA.slice(0, teamACount)];
          while (newTeamA.length < half) newTeamA.push('');
          
          // Fill Team B (remaining players, prioritizing from prev Team B)
          const remaining = playerCount - half;
          const fromTeamB = Math.min(prevTeamB.length, remaining);
          const fromTeamA = Math.min(prevTeamA.length - teamACount, remaining - fromTeamB);
          
          newTeamB = [
            ...prevTeamB.slice(0, fromTeamB),
            ...prevTeamA.slice(teamACount, teamACount + fromTeamA)
          ];
          while (newTeamB.length < remaining) newTeamB.push('');
          
          setTeamA(newTeamA);
          setTeamB(newTeamB);
        } else {
          // Fallback: split flat list evenly
          const allMembers = savedData.teamMembers.slice(0, playerCount);
          while (allMembers.length < playerCount) {
            allMembers.push('');
          }
          
          const half = Math.ceil(playerCount / 2);
          const newTeamA = allMembers.slice(0, half);
          const newTeamB = allMembers.slice(half, playerCount);
          
          setTeamA(newTeamA);
          setTeamB(newTeamB);
        }
      } else {
        // Initialize empty teams
        const half = Math.ceil(playerCount / 2);
        const initialTeamA = Array(half).fill('');
        const initialTeamB = Array(playerCount - half).fill('');
        setTeamA(initialTeamA);
        setTeamB(initialTeamB);
      }
      
      setIsLoading(false);
    };

    loadTeamMembers();
  }, [playerCount]);

  // Auto-save to localStorage whenever teams change
  useEffect(() => {
    if (isLoading) return;
    
    const allMembers = [...teamA, ...teamB];
    saveTeamMembers(allMembers, playerCount, teamA, teamB);
  }, [teamA, teamB, playerCount, isLoading]);

  // Handle adding a new player slot
  const handleAddPlayer = (team: 'A' | 'B') => {
    if (team === 'A') {
      setTeamA([...teamA, '']);
    } else {
      setTeamB([...teamB, '']);
    }
  };

  // Handle removing a player
  const handleRemovePlayer = (team: 'A' | 'B', index: number) => {
    if (team === 'A') {
      const newTeamA = teamA.filter((_, i) => i !== index);
      setTeamA(newTeamA);
    } else {
      const newTeamB = teamB.filter((_, i) => i !== index);
      setTeamB(newTeamB);
    }
  };

  // Handle player name change
  const handleNameChange = (team: 'A' | 'B', index: number, value: string) => {
    if (team === 'A') {
      const newTeamA = [...teamA];
      newTeamA[index] = value;
      setTeamA(newTeamA);
    } else {
      const newTeamB = [...teamB];
      newTeamB[index] = value;
      setTeamB(newTeamB);
    }
  };

  // Handle continue button
  const handleContinue = () => {
    const filteredTeamA = teamA.filter(name => name.trim() !== '');
    const filteredTeamB = teamB.filter(name => name.trim() !== '');
    
    if (onComplete) {
      onComplete(filteredTeamA, filteredTeamB);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-xl text-text-secondary">در حال بارگذاری...</div>
      </div>
    );
  }

  const totalPlayers = teamA.length + teamB.length;
  const hasValidPlayers = teamA.some(name => name.trim() !== '') || teamB.some(name => name.trim() !== '');

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl md:text-4xl font-bold glow-text mb-2">
          تشکیل تیم‌ها
        </h2>
        <p className="text-text-secondary text-lg">
          بازیکنان را به دو تیم تقسیم کنید
        </p>
      </motion.div>

      {/* Teams Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-8">
        {/* Team A */}
        <motion.div
          initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
          className="relative"
        >
          <div
            className="rounded-2xl p-6 border-2 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(108, 92, 231, 0.1), rgba(162, 155, 254, 0.05))',
              borderColor: '#6c5ce7',
              boxShadow: '0 0 30px rgba(108, 92, 231, 0.3), inset 0 0 30px rgba(108, 92, 231, 0.1)',
            }}
          >
            {/* Team A Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl text-white"
                  style={{
                    background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)',
                    boxShadow: '0 0 20px rgba(108, 92, 231, 0.5)',
                  }}
                >
                  A
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">تیم A</h3>
                  <p className="text-text-secondary text-sm">{teamA.length} بازیکن</p>
                </div>
              </div>
            </div>

            {/* Team A Players List */}
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {teamA.map((name, index) => (
                  <motion.div
                    key={`teamA-${index}`}
                    initial={{ opacity: 0, scale: 0.9, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => handleNameChange('A', index, e.target.value)}
                      placeholder={`بازیکن ${index + 1}`}
                      className="flex-1 px-4 py-2 bg-bg-tertiary border border-accent/30 rounded-lg text-text-primary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                      style={{
                        boxShadow: name.trim() ? '0 0 10px rgba(108, 92, 231, 0.2)' : 'none',
                      }}
                    />
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleRemovePlayer('A', index)}
                      className="w-10 h-10 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 flex items-center justify-center hover:bg-red-500/30 transition-all"
                      aria-label="حذف بازیکن"
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

              {/* Add Player Button for Team A */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAddPlayer('A')}
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
                <span className="font-medium">افزودن بازیکن</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Team B */}
        <motion.div
          initial={{ opacity: 0, x: isRTL ? -50 : 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.2 }}
          className="relative"
        >
          <div
            className="rounded-2xl p-6 border-2 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(78, 205, 196, 0.1), rgba(69, 183, 209, 0.05))',
              borderColor: '#4ECDC4',
              boxShadow: '0 0 30px rgba(78, 205, 196, 0.3), inset 0 0 30px rgba(78, 205, 196, 0.1)',
            }}
          >
            {/* Team B Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl text-white"
                  style={{
                    background: 'linear-gradient(135deg, #4ECDC4, #45B7D1)',
                    boxShadow: '0 0 20px rgba(78, 205, 196, 0.5)',
                  }}
                >
                  B
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">تیم B</h3>
                  <p className="text-text-secondary text-sm">{teamB.length} بازیکن</p>
                </div>
              </div>
            </div>

            {/* Team B Players List */}
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {teamB.map((name, index) => (
                  <motion.div
                    key={`teamB-${index}`}
                    initial={{ opacity: 0, scale: 0.9, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => handleNameChange('B', index, e.target.value)}
                      placeholder={`بازیکن ${index + 1}`}
                      className="flex-1 px-4 py-2 bg-bg-tertiary border border-accent/30 rounded-lg text-text-primary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                      style={{
                        borderColor: '#4ECDC4',
                        boxShadow: name.trim() ? '0 0 10px rgba(78, 205, 196, 0.2)' : 'none',
                      }}
                    />
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleRemovePlayer('B', index)}
                      className="w-10 h-10 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 flex items-center justify-center hover:bg-red-500/30 transition-all"
                      aria-label="حذف بازیکن"
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

              {/* Add Player Button for Team B */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAddPlayer('B')}
                className="w-full py-3 rounded-lg border-2 border-dashed text-teal-400 flex items-center justify-center gap-2 hover:border-teal-400 hover:bg-teal-400/10 transition-all"
                style={{
                  borderColor: '#4ECDC4',
                  boxShadow: '0 0 15px rgba(78, 205, 196, 0.2)',
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
                <span className="font-medium">افزودن بازیکن</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Start/Continue Button */}
      {showStartButton && (
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
            {startButtonText}
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}


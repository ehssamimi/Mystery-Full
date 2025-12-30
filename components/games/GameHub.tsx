'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface GameHubProps {
  children: ReactNode;
  onBack?: () => void;
  className?: string;
}

/**
 * GameHub - Wrapper component for all game flows
 * Provides consistent back button navigation for all games
 */
export default function GameHub({ children, onBack, className = '' }: GameHubProps) {
  return (
    <div className={`min-h-screen relative ${className}`}>
      {/* Back Button - Always visible at top left */}
      {onBack && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={onBack}
          className="fixed top-4 left-4 z-50 p-3 hover:bg-bg-secondary/80 backdrop-blur-sm rounded-lg transition-all duration-200 shadow-lg"
          whileHover={{ scale: 1.05, x: 2 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Back"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </motion.button>
      )}

      {/* Game Content */}
      {children}
    </div>
  );
}


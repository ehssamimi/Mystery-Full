'use client';

import { PanInfo, motion } from 'framer-motion';
import { useState } from 'react';

export type PantomimeSwipeType = 'correct' | 'wrong' | 'skip';

export interface PantomimeCardProps {
  word: string;
  active: boolean;
  removeCard: (word: string, swipe: PantomimeSwipeType) => void;
  onScoreUpdate?: (delta: number) => void;
}

const PantomimeCard: React.FC<PantomimeCardProps> = ({
  word,
  active,
  removeCard,
  onScoreUpdate,
}) => {
  const [leaveX, setLeaveX] = useState(0);
  const [leaveY, setLeaveY] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  
  const onDrag = (_e: any, info: PanInfo) => {
    setDragOffset(info.offset.x);
  };

  const onDragEnd = (_e: any, info: PanInfo) => {
    // Right swipe = Wrong (-1)
    if (info.offset.x > 100) {
      setLeaveX(1000);
      removeCard(word, 'wrong');
      return;
    }
    // Left swipe = Correct (+1)
    if (info.offset.x < -100) {
      setLeaveX(-1000);
      removeCard(word, 'correct');
      return;
    }
    // Reset drag offset if not swiped enough
    setDragOffset(0);
  };

  // Calculate overlay opacity based on drag offset
  const getOverlayOpacity = (offset: number) => {
    const maxOffset = 150;
    return Math.min(Math.abs(offset) / maxOffset, 0.9);
  };

  const classNames = `absolute w-[calc(100%-32px)] sm:w-[calc(100%-48px)] md:w-[500px] h-[280px] sm:h-[330px] md:h-[380px] border-2 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl select-none bg-[var(--bg-secondary)] backdrop-blur-[8px] border-[rgba(108,92,231,0.3)] flex flex-col justify-center items-center cursor-grab`;

  return (
    <>
      {active ? (
        <motion.div
          drag={true}
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          onDrag={onDrag}
          onDragEnd={onDragEnd}
          initial={{
            scale: 1,
          }}
          animate={{
            scale: 1.05,
            rotate: `${word.length % 2 === 0 ? 2 : -2}deg`,
          }}
          exit={{
            x: leaveX,
            y: leaveY,
            opacity: 0,
            scale: 0.5,
            transition: { duration: 0.2 },
          }}
          className={classNames}
        >
          {/* Green Overlay (Correct - Left Swipe) */}
          {dragOffset < 0 && (
            <div
              className="absolute inset-0 rounded-xl sm:rounded-2xl pointer-events-none z-20"
              style={{
                backgroundColor: `rgba(34, 197, 94, ${getOverlayOpacity(dragOffset)})`,
                transition: 'opacity 0.1s linear',
              }}
            />
          )}

          {/* Red Overlay (Wrong - Right Swipe) */}
          {dragOffset > 0 && (
            <div
              className="absolute inset-0 rounded-xl sm:rounded-2xl pointer-events-none z-20"
              style={{
                backgroundColor: `rgba(239, 68, 68, ${getOverlayOpacity(dragOffset)})`,
                transition: 'opacity 0.1s linear',
              }}
            />
          )}

          {/* Word Text */}
          <div
            className="relative z-10 text-center px-2 sm:px-4"
            style={{
              opacity: dragOffset !== 0 
                ? Math.max(0.2, 1 - getOverlayOpacity(dragOffset) * 0.9) 
                : 1,
              transition: 'opacity 0.1s linear',
            }}
          >
            <WordText word={word} />
          </div>
        </motion.div>
      ) : (
        <div
          className={`${classNames} ${
            word.length % 2 === 0 ? 'rotate-2' : '-rotate-2'
          } opacity-80`}
        >
          <WordText word={word} />
        </div>
      )}
    </>
  );
};

const WordText: React.FC<{ word: string }> = ({ word }) => {
  return (
    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary leading-relaxed text-center px-2 sm:px-4">
      {word}
    </h2>
  );
};

export default PantomimeCard;

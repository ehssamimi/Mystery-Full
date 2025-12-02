'use client';

import { motion } from 'framer-motion';

interface RatingStarsProps {
  value: number;
  max?: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function RatingStars({
  value,
  max = 5,
  onChange,
  readOnly = false,
  size = 'md',
}: RatingStarsProps) {
  const stars = Array.from({ length: max }, (_, i) => i + 1);
  const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-7 h-7' : 'w-5 h-5';

  return (
    <div className="flex items-center gap-1">
      {stars.map((star) => {
        const filled = star <= Math.round(value);
        const handleClick = () => {
          if (readOnly || !onChange) return;
          onChange(star);
        };

        return (
          <motion.button
            key={star}
            type="button"
            onClick={handleClick}
            whileHover={readOnly ? undefined : { scale: 1.15 }}
            whileTap={readOnly ? undefined : { scale: 0.9 }}
            className={`p-0.5 rounded-full ${
              readOnly || !onChange ? 'cursor-default' : 'cursor-pointer'
            }`}
          >
            <svg
              className={`${iconSize} ${
                filled ? 'text-yellow-400' : 'text-text-secondary'
              } drop-shadow`}
              fill={filled ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.966a1 1 0 00.95.69h4.174c.969 0 1.371 1.24.588 1.81l-3.38 2.457a1 1 0 00-.364 1.118l1.287 3.966c.3.921-.755 1.688-1.54 1.118l-3.38-2.457a1 1 0 00-1.175 0l-3.38 2.457c-.784.57-1.838-.197-1.539-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.393c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.966z"
              />
            </svg>
          </motion.button>
        );
      })}
    </div>
  );
}



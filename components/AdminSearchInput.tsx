'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface AdminSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  isRTL: boolean;
  className?: string;
}

export default function AdminSearchInput({
  value,
  onChange,
  placeholder,
  isRTL,
  className = '',
}: AdminSearchInputProps) {
  const hasValue = value.trim().length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          dir={isRTL ? 'rtl' : 'ltr'}
          style={{
            paddingTop: '0.75rem',
            paddingBottom: '0.75rem',
            ...(isRTL
              ? hasValue
                ? { paddingRight: '1rem', paddingLeft: '3rem' }
                : { paddingRight: '47px', paddingLeft: '1rem' }
              : hasValue
              ? { paddingLeft: '1rem', paddingRight: '3rem' }
              : { paddingLeft: '47px', paddingRight: '1rem' }),
          }}
          className="w-full bg-bg-secondary/80 backdrop-blur-sm border border-accent/30 rounded-lg text-text-primary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-200"
        />

        {/* آیکن جستجو وقتی ورودی خالی است */}
        <AnimatePresence>
          {!hasValue && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`absolute top-1/2 transform -translate-y-1/2 ${
                isRTL ? 'right-4' : 'left-4'
              }`}
            >
              <svg
                className="w-5 h-5 text-text-secondary pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>

        {/* دکمه پاک کردن وقتی مقدار وجود دارد */}
        <AnimatePresence>
          {hasValue && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => onChange('')}
              className={`absolute top-[35%] transform -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50 transition-all duration-200 ${
                isRTL ? 'left-3' : 'right-3'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="پاک کردن"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}



'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export default function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'حذف',
  cancelText = 'انصراف',
  isLoading = false,
}: DeleteModalProps) {
  // جلوگیری از scroll در body وقتی مودال باز است
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // بستن با کلید Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, isLoading, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={isLoading ? undefined : onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            style={{ 
              // برای موبایل: full screen
              // برای دسکتاپ: centered modal
            }}
          >
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-bg-secondary/95 backdrop-blur-md rounded-xl md:rounded-2xl border border-accent/30 shadow-2xl w-full max-w-md mx-auto"
              style={{
                boxShadow: '0 0 40px rgba(108, 92, 231, 0.3), 0 0 80px rgba(108, 92, 231, 0.1)',
              }}
            >
              {/* Header */}
              <div className="p-4 md:p-6 border-b border-accent/20">
                <h3 className="text-xl md:text-2xl font-bold glow-text text-red-300">
                  {title}
                </h3>
              </div>

              {/* Body */}
              <div className="p-4 md:p-6">
                <p className="text-text-secondary text-base md:text-lg leading-relaxed">
                  {message}
                </p>
              </div>

              {/* Footer */}
              <div className="p-4 md:p-6 border-t border-accent/20 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end">
                <motion.button
                  onClick={onClose}
                  disabled={isLoading}
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  className="px-4 md:px-6 py-2.5 md:py-3 text-sm md:text-base bg-bg-tertiary hover:bg-bg-tertiary/80 text-text-primary font-semibold rounded-lg transition-all duration-200 border border-accent/20 disabled:opacity-50 disabled:cursor-not-allowed order-2 sm:order-1"
                >
                  {cancelText}
                </motion.button>
                <motion.button
                  onClick={onConfirm}
                  disabled={isLoading}
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  className="px-4 md:px-6 py-2.5 md:py-3 text-sm md:text-base bg-red-500/20 hover:bg-red-500/30 text-red-300 font-semibold rounded-lg transition-all duration-200 border border-red-500/50 glow-sm disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4 md:h-5 md:w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>در حال حذف...</span>
                    </span>
                  ) : (
                    confirmText
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}


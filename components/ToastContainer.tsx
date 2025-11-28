'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useNotificationStore } from '@/lib/store/notification-store';
import { useLanguageStore } from '@/lib/store/language-store';

export default function ToastContainer() {
  const { notifications, removeNotification } = useNotificationStore();
  const { isRTL } = useLanguageStore();

  return (
    <div
      className="fixed z-[9999] pointer-events-none p-3 md:p-4 w-full max-w-md"
      style={{
        top: '0.5rem',
        [isRTL ? 'left' : 'right']: '0.5rem',
      }}
    >
      <div className="flex flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: isRTL ? -100 : 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: isRTL ? -100 : 100, scale: 0.8 }}
              transition={{
                type: 'spring',
                damping: 25,
                stiffness: 300,
              }}
              className="pointer-events-auto"
            >
              <Toast
                notification={notification}
                onClose={() => removeNotification(notification.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

interface ToastProps {
  notification: {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  };
  onClose: () => void;
}

function Toast({ notification, onClose }: ToastProps) {
  const { isRTL } = useLanguageStore();

  const typeConfig = {
    success: {
      bg: 'bg-green-500/20',
      border: 'border-green-500/50',
      text: 'text-green-300',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    error: {
      bg: 'bg-red-500/20',
      border: 'border-red-500/50',
      text: 'text-red-300',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    info: {
      bg: 'bg-blue-500/20',
      border: 'border-blue-500/50',
      text: 'text-blue-300',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    warning: {
      bg: 'bg-yellow-500/20',
      border: 'border-yellow-500/50',
      text: 'text-yellow-300',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
  };

  const config = typeConfig[notification.type];

  return (
    <motion.div
      className={`
        ${config.bg} ${config.border} ${config.text}
        backdrop-blur-md rounded-xl border p-4 shadow-2xl
        flex items-start gap-3 min-w-[280px] max-w-md
      `}
      style={{
        boxShadow: '0 0 20px rgba(108, 92, 231, 0.2), 0 4px 12px rgba(0, 0, 0, 0.3)',
      }}
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Icon */}
      <div className={`${config.text} flex-shrink-0 mt-0.5`}>
        {config.icon}
      </div>

      {/* Message */}
      <div className="flex-1 min-w-0">
        <p className="text-sm md:text-base font-medium leading-relaxed break-words">
          {notification.message}
        </p>
      </div>

      {/* Close Button */}
      <motion.button
        onClick={onClose}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`
          ${config.text} opacity-70 hover:opacity-100
          flex-shrink-0 transition-opacity duration-200
        `}
        aria-label="Close notification"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </motion.button>
    </motion.div>
  );
}


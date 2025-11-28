import { useNotificationStore } from '@/lib/store/notification-store';
import type { NotificationType } from '@/lib/store/notification-store';

/**
 * Helper functions for showing notifications
 * These can be used directly or through hooks
 */

export const useNotifications = () => {
  const { addNotification } = useNotificationStore();

  return {
    success: (message: string, duration?: number) => {
      addNotification({ type: 'success', message, duration });
    },
    error: (message: string, duration?: number) => {
      addNotification({ type: 'error', message, duration });
    },
    info: (message: string, duration?: number) => {
      addNotification({ type: 'info', message, duration });
    },
    warning: (message: string, duration?: number) => {
      addNotification({ type: 'warning', message, duration });
    },
  };
};

/**
 * Direct notification functions (for use outside React components)
 * Note: These require access to the store, so they're mainly for convenience
 */
export const notify = {
  success: (message: string, duration?: number) => {
    const store = useNotificationStore.getState();
    store.addNotification({ type: 'success', message, duration });
  },
  error: (message: string, duration?: number) => {
    const store = useNotificationStore.getState();
    store.addNotification({ type: 'error', message, duration });
  },
  info: (message: string, duration?: number) => {
    const store = useNotificationStore.getState();
    store.addNotification({ type: 'info', message, duration });
  },
  warning: (message: string, duration?: number) => {
    const store = useNotificationStore.getState();
    store.addNotification({ type: 'warning', message, duration });
  },
};


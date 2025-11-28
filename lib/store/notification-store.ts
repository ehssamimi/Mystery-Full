import { create } from 'zustand';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number; // در میلی‌ثانیه، پیش‌فرض 3000
}

interface NotificationStore {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  addNotification: (notification) => {
    const id = `notification-${Date.now()}-${Math.random()}`;
    const duration = notification.duration ?? 3000;
    const newNotification: Notification = {
      ...notification,
      id,
      duration,
    };
    
    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));

    // حذف خودکار بعد از مدت زمان مشخص
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      }, duration);
    }
  },
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },
  clearAll: () => {
    set({ notifications: [] });
  },
}));


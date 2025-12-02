import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  phone: string;
  role: 'user' | 'admin';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasChecked: boolean;
  login: (phone: string, code: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      hasChecked: false,

      login: async (phone: string, code: string) => {
        try {
          // ارسال شماره تلفن
          const loginResponse = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone }),
          });

          const loginData = await loginResponse.json();

          if (!loginData.success) {
            return { success: false, error: loginData.error || 'خطا در ارسال کد' };
          }

          // تأیید کد
          const verifyResponse = await fetch('/api/auth/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, code }),
          });

          const verifyData = await verifyResponse.json();

          if (!verifyData.success) {
            return { success: false, error: verifyData.error || 'کد تأیید نامعتبر است' };
          }

          set({
            user: verifyData.user,
            isAuthenticated: true,
            isLoading: false,
          });

          return { success: true };
        } catch (error) {
          console.error('Login error:', error);
          return { success: false, error: 'خطا در ارتباط با سرور' };
        }
      },

      logout: async () => {
        try {
          await fetch('/api/auth/logout', {
            method: 'POST',
          });
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      checkAuth: async () => {
        const { hasChecked } = get();
        // اگر قبلاً وضعیت احراز هویت چک شده، دوباره درخواست نزن
        if (hasChecked) {
          return;
        }

        try {
          set({ isLoading: true });
          const response = await fetch('/api/auth/me');
          const data = await response.json();

          if (data.success && data.user) {
            set({
              user: data.user,
              isAuthenticated: true,
              isLoading: false,
              hasChecked: true,
            });
          } else {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              hasChecked: true,
            });
          }
        } catch (error) {
          console.error('Check auth error:', error);
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            hasChecked: true,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);


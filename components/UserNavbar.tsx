'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth-store';
import { useLanguageStore } from '@/lib/store/language-store';
import { translations } from '@/lib/translations';
import LanguageSwitcher from './LanguageSwitcher';

export default function UserNavbar() {
  const router = useRouter();
  const { logout, isAuthenticated, user } = useAuthStore();
  const { language, isRTL } = useLanguageStore();
  const t = translations[language];

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Only show navbar for authenticated users (not admins on admin pages)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`fixed top-0 left-0 right-0 z-50 bg-bg-secondary/90 backdrop-blur-md border-b border-accent/20 ${
        isRTL ? 'shadow-[0_2px_20px_rgba(108,92,231,0.3)]' : 'shadow-[0_2px_20px_rgba(108,92,231,0.3)]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo/Home Link */}
          <Link href="/">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="text-2xl md:text-3xl font-bold glow-text">
                🎮 Mystery Full
              </div>
            </motion.div>
          </Link>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* Favorites Link */}
            <Link href="/favorites">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg bg-bg-tertiary/50 hover:bg-bg-tertiary border border-accent/20 hover:border-accent/50 transition-all duration-200 text-text-primary"
              >
                <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                <span className="hidden sm:inline font-medium">{t.favorites}</span>
              </motion.button>
            </Link>

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Logout Button */}
            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 hover:border-red-500/70 text-red-300 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline font-medium">{t.logout}</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}


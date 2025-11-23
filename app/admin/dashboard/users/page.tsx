'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/store/auth-store';

interface User {
  id: string;
  phone: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
  favoritesCount?: number;
  favoriteGames?: Array<{
    id: string;
    name: string;
    nameEn: string;
  }>;
}

export default function UsersPage() {
  const router = useRouter();
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchUsers();
    }
  }, [isAuthenticated, user]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();

      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
    if (userId === user?.id) {
      alert('نمی‌توانید نقش خود را تغییر دهید');
      return;
    }

    setUpdating(userId);

    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });

      const data = await response.json();

      if (data.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      } else {
        alert(data.error || 'خطا در تغییر نقش');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('خطا در تغییر نقش');
    } finally {
      setUpdating(null);
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl glow-text">در حال بارگذاری...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 relative z-10">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 md:mb-8"
        >
          <Link
            href="/admin/dashboard"
            className="inline-block mb-3 md:mb-4 text-sm md:text-base text-accent hover:text-accent-glow transition-colors"
          >
            ← بازگشت به داشبورد
          </Link>
          <h1 className="text-2xl md:text-4xl font-bold glow-text">مدیریت کاربران</h1>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-xl md:text-2xl glow-text">در حال بارگذاری...</div>
          </div>
        ) : (
          <>
            {/* Mobile: Card View */}
            <div className="md:hidden space-y-4">
              {users.map((u, index) => (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-bg-secondary/80 backdrop-blur-sm rounded-xl p-4 border border-accent/20"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="text-lg font-semibold text-text-primary mb-1">{u.phone}</div>
                      <div className="text-sm text-text-secondary mb-2">
                        {new Date(u.createdAt).toLocaleDateString('fa-IR')}
                      </div>
                      {u.favoritesCount !== undefined && (
                        <div className="text-xs text-text-secondary">
                          ❤️ {u.favoritesCount} بازی مورد علاقه
                        </div>
                      )}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        u.role === 'admin'
                          ? 'bg-purple-500/20 text-purple-300'
                          : 'bg-blue-500/20 text-blue-300'
                      }`}
                    >
                      {u.role === 'admin' ? 'مدیر' : 'کاربر'}
                    </span>
                  </div>
                  {u.favoriteGames && u.favoriteGames.length > 0 && (
                    <div className="mb-3 p-2 bg-bg-tertiary/50 rounded-lg">
                      <div className="text-xs text-text-secondary mb-1">بازی‌های مورد علاقه:</div>
                      <div className="flex flex-wrap gap-1">
                        {u.favoriteGames.map((game) => (
                          <span
                            key={game.id}
                            className="text-xs px-2 py-1 bg-accent/20 text-accent rounded"
                          >
                            {game.name}
                          </span>
                        ))}
                        {u.favoritesCount && u.favoritesCount > u.favoriteGames.length && (
                          <span className="text-xs px-2 py-1 text-text-secondary">
                            +{u.favoritesCount - u.favoriteGames.length} بیشتر
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  {u.id !== user?.id ? (
                    <select
                      value={u.role}
                      onChange={(e) =>
                        handleRoleChange(u.id, e.target.value as 'user' | 'admin')
                      }
                      disabled={updating === u.id}
                      className="w-full px-3 py-2 bg-bg-tertiary border border-accent/30 rounded-lg text-text-primary focus:outline-none focus:border-accent disabled:opacity-50 text-sm"
                    >
                      <option value="user">کاربر</option>
                      <option value="admin">مدیر</option>
                    </select>
                  ) : (
                    <div className="text-sm text-text-muted">شما</div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Desktop: Table View */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="hidden md:block bg-bg-secondary/80 backdrop-blur-sm rounded-2xl p-6 border border-accent/20"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-accent/20">
                      <th className="text-right p-4 text-text-secondary">شماره تلفن</th>
                      <th className="text-right p-4 text-text-secondary">نقش</th>
                      <th className="text-right p-4 text-text-secondary">تاریخ عضویت</th>
                      <th className="text-right p-4 text-text-secondary">بازی‌های مورد علاقه</th>
                      <th className="text-right p-4 text-text-secondary">عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, index) => (
                      <motion.tr
                        key={u.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-accent/10 hover:bg-bg-tertiary/50 transition-colors"
                      >
                        <td className="p-4">{u.phone}</td>
                        <td className="p-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm ${
                              u.role === 'admin'
                                ? 'bg-purple-500/20 text-purple-300'
                                : 'bg-blue-500/20 text-blue-300'
                            }`}
                          >
                            {u.role === 'admin' ? 'مدیر' : 'کاربر'}
                          </span>
                        </td>
                      <td className="p-4 text-text-secondary text-sm">
                        {new Date(u.createdAt).toLocaleDateString('fa-IR')}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <div className="text-sm text-text-secondary">
                            ❤️ {u.favoritesCount || 0} بازی
                          </div>
                          {u.favoriteGames && u.favoriteGames.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {u.favoriteGames.slice(0, 3).map((game) => (
                                <span
                                  key={game.id}
                                  className="text-xs px-2 py-1 bg-accent/20 text-accent rounded"
                                  title={game.nameEn}
                                >
                                  {game.name}
                                </span>
                              ))}
                              {u.favoritesCount && u.favoritesCount > (u.favoriteGames.length || 0) && (
                                <span className="text-xs px-2 py-1 text-text-secondary">
                                  +{u.favoritesCount - (u.favoriteGames.length || 0)}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                          {u.id !== user?.id ? (
                            <select
                              value={u.role}
                              onChange={(e) =>
                                handleRoleChange(u.id, e.target.value as 'user' | 'admin')
                              }
                              disabled={updating === u.id}
                              className="px-3 py-1 bg-bg-tertiary border border-accent/30 rounded-lg text-text-primary focus:outline-none focus:border-accent disabled:opacity-50"
                            >
                              <option value="user">کاربر</option>
                              <option value="admin">مدیر</option>
                            </select>
                          ) : (
                            <span className="text-text-muted text-sm">شما</span>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}


'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/store/auth-store';
import { useNotificationStore } from '@/lib/store/notification-store';

interface Game {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  minPlayers: number;
  maxPlayers: number;
  category: string;
  rules: string;
  tips?: string;
  difficulty: string;
  duration: number;
  materials?: string;
}

export default function GamesPage() {
  const router = useRouter();
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchGames();
    }
  }, [isAuthenticated, user]);

  const fetchGames = async () => {
    try {
      const response = await fetch('/api/admin/games');
      const data = await response.json();

      if (data.success) {
        setGames(data.games);
      }
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingGame) return;

    setSaving(true);

    try {
      const formData = new FormData(e.currentTarget);
      const updateData: Partial<Game> = {};

      // جمع‌آوری فیلدهای تغییر یافته
      if (formData.get('name')) updateData.name = formData.get('name') as string;
      if (formData.get('nameEn')) updateData.nameEn = formData.get('nameEn') as string;
      if (formData.get('description'))
        updateData.description = formData.get('description') as string;
      if (formData.get('minPlayers'))
        updateData.minPlayers = parseInt(formData.get('minPlayers') as string);
      if (formData.get('maxPlayers'))
        updateData.maxPlayers = parseInt(formData.get('maxPlayers') as string);
      if (formData.get('category')) updateData.category = formData.get('category') as string;
      if (formData.get('rules')) updateData.rules = formData.get('rules') as string;
      if (formData.get('tips')) updateData.tips = formData.get('tips') as string;
      if (formData.get('difficulty'))
        updateData.difficulty = formData.get('difficulty') as string;
      if (formData.get('duration'))
        updateData.duration = parseInt(formData.get('duration') as string);
      if (formData.get('materials'))
        updateData.materials = formData.get('materials') as string;

      const response = await fetch('/api/admin/games', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingGame.id, ...updateData }),
      });

      const data = await response.json();

      if (data.success) {
        setGames((prev) =>
          prev.map((g) => (g.id === editingGame.id ? data.game : g))
        );
        setEditingGame(null);
        addNotification({
          type: 'success',
          message: 'بازی با موفقیت به‌روزرسانی شد',
        });
      } else {
        addNotification({
          type: 'error',
          message: data.error || 'خطا در به‌روزرسانی بازی',
        });
      }
    } catch (error) {
      console.error('Error updating game:', error);
      addNotification({
        type: 'error',
        message: 'خطا در به‌روزرسانی بازی',
      });
    } finally {
      setSaving(false);
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
          className="mb-8"
        >
          <Link
            href="/admin/dashboard"
            className="inline-block mb-4 text-accent hover:text-accent-glow transition-colors"
          >
            ← بازگشت به داشبورد
          </Link>
          <h1 className="text-4xl font-bold glow-text">مدیریت بازی‌ها</h1>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-2xl glow-text">در حال بارگذاری...</div>
          </div>
        ) : (
          <>
            {editingGame ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-bg-secondary/80 backdrop-blur-sm rounded-2xl p-6 border border-accent/20"
              >
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-text-secondary">
                        نام فارسی
                      </label>
                      <input
                        type="text"
                        name="name"
                        defaultValue={editingGame.name}
                        className="w-full px-4 py-2 bg-bg-tertiary border border-accent/30 rounded-lg text-text-primary focus:outline-none focus:border-accent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-text-secondary">
                        نام انگلیسی
                      </label>
                      <input
                        type="text"
                        name="nameEn"
                        defaultValue={editingGame.nameEn}
                        className="w-full px-4 py-2 bg-bg-tertiary border border-accent/30 rounded-lg text-text-primary focus:outline-none focus:border-accent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-text-secondary">
                      توضیحات
                    </label>
                    <textarea
                      name="description"
                      defaultValue={editingGame.description}
                      rows={3}
                      className="w-full px-4 py-2 bg-bg-tertiary border border-accent/30 rounded-lg text-text-primary focus:outline-none focus:border-accent"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-text-secondary">
                        حداقل بازیکن
                      </label>
                      <input
                        type="number"
                        name="minPlayers"
                        defaultValue={editingGame.minPlayers}
                        min="1"
                        className="w-full px-4 py-2 bg-bg-tertiary border border-accent/30 rounded-lg text-text-primary focus:outline-none focus:border-accent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-text-secondary">
                        حداکثر بازیکن
                      </label>
                      <input
                        type="number"
                        name="maxPlayers"
                        defaultValue={editingGame.maxPlayers}
                        min="1"
                        className="w-full px-4 py-2 bg-bg-tertiary border border-accent/30 rounded-lg text-text-primary focus:outline-none focus:border-accent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-text-secondary">
                        مدت زمان (دقیقه)
                      </label>
                      <input
                        type="number"
                        name="duration"
                        defaultValue={editingGame.duration}
                        min="1"
                        className="w-full px-4 py-2 bg-bg-tertiary border border-accent/30 rounded-lg text-text-primary focus:outline-none focus:border-accent"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-text-secondary">
                        دسته‌بندی
                      </label>
                      <input
                        type="text"
                        name="category"
                        defaultValue={editingGame.category}
                        className="w-full px-4 py-2 bg-bg-tertiary border border-accent/30 rounded-lg text-text-primary focus:outline-none focus:border-accent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-text-secondary">
                        سطح دشواری
                      </label>
                      <select
                        name="difficulty"
                        defaultValue={editingGame.difficulty}
                        className="w-full px-4 py-2 bg-bg-tertiary border border-accent/30 rounded-lg text-text-primary focus:outline-none focus:border-accent"
                        required
                      >
                        <option value="easy">آسان</option>
                        <option value="medium">متوسط</option>
                        <option value="hard">سخت</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-text-secondary">
                      قوانین
                    </label>
                    <textarea
                      name="rules"
                      defaultValue={editingGame.rules}
                      rows={4}
                      className="w-full px-4 py-2 bg-bg-tertiary border border-accent/30 rounded-lg text-text-primary focus:outline-none focus:border-accent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-text-secondary">
                      نکات (اختیاری)
                    </label>
                    <textarea
                      name="tips"
                      defaultValue={editingGame.tips || ''}
                      rows={2}
                      className="w-full px-4 py-2 bg-bg-tertiary border border-accent/30 rounded-lg text-text-primary focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-text-secondary">
                      مواد مورد نیاز (اختیاری)
                    </label>
                    <input
                      type="text"
                      name="materials"
                      defaultValue={editingGame.materials || ''}
                      className="w-full px-4 py-2 bg-bg-tertiary border border-accent/30 rounded-lg text-text-primary focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div className="flex gap-4">
                    <motion.button
                      type="submit"
                      disabled={saving}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-2 bg-accent hover:bg-accent-glow text-white font-semibold rounded-lg transition-all duration-200 glow disabled:opacity-50"
                    >
                      {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={() => setEditingGame(null)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-2 bg-bg-tertiary hover:bg-bg-tertiary/80 text-text-primary font-semibold rounded-lg transition-all duration-200 border border-accent/20"
                    >
                      انصراف
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-bg-secondary/80 backdrop-blur-sm rounded-2xl p-6 border border-accent/20"
              >
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-accent/20">
                        <th className="text-right p-4 text-text-secondary">نام</th>
                        <th className="text-right p-4 text-text-secondary">بازیکنان</th>
                        <th className="text-right p-4 text-text-secondary">دسته‌بندی</th>
                        <th className="text-right p-4 text-text-secondary">عملیات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {games.map((game, index) => (
                        <motion.tr
                          key={game.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.02 }}
                          className="border-b border-accent/10 hover:bg-bg-tertiary/50 transition-colors"
                        >
                          <td className="p-4">
                            <div>
                              <div className="font-semibold">{game.name}</div>
                              <div className="text-sm text-text-secondary">{game.nameEn}</div>
                            </div>
                          </td>
                          <td className="p-4">
                            {game.minPlayers} - {game.maxPlayers} نفر
                          </td>
                          <td className="p-4">{game.category}</td>
                          <td className="p-4">
                            <motion.button
                              onClick={() => setEditingGame(game)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="px-4 py-2 bg-accent/20 hover:bg-accent/30 text-accent rounded-lg transition-all duration-200"
                            >
                              ویرایش
                            </motion.button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}


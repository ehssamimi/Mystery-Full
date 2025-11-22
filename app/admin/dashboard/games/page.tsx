'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/store/auth-store';
import { useLanguageStore } from '@/lib/store/language-store';
import { translations } from '@/lib/translations';

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
  const { language } = useLanguageStore();
  const t = translations[language];
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [creatingGame, setCreatingGame] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

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

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData(e.currentTarget);
      const gameData = {
        name: formData.get('name') as string,
        nameEn: formData.get('nameEn') as string,
        description: formData.get('description') as string,
        minPlayers: parseInt(formData.get('minPlayers') as string),
        maxPlayers: parseInt(formData.get('maxPlayers') as string),
        category: formData.get('category') as string,
        rules: formData.get('rules') as string,
        tips: formData.get('tips') as string || undefined,
        difficulty: formData.get('difficulty') as string,
        duration: parseInt(formData.get('duration') as string),
        materials: formData.get('materials') as string || undefined,
      };

      const response = await fetch('/api/admin/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gameData),
      });

      const data = await response.json();

      if (data.success) {
        setGames((prev) => [data.game, ...prev]);
        setCreatingGame(false);
        alert(t.gameCreated);
      } else {
        alert(data.error || t.error);
      }
    } catch (error) {
      console.error('Error creating game:', error);
      alert('خطا در ایجاد بازی');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingGame) return;

    setSaving(true);

    try {
      const formData = new FormData(e.currentTarget);
      const updateData: Partial<Game> = {};

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
        alert(t.gameUpdated);
      } else {
        alert(data.error || t.error);
      }
    } catch (error) {
      console.error('Error updating game:', error);
      alert(t.error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (gameId: string) => {
    if (!confirm(t.deleteConfirm)) {
      return;
    }

    setDeleting(gameId);

    try {
      const response = await fetch(`/api/admin/games?id=${gameId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setGames((prev) => prev.filter((g) => g.id !== gameId));
        alert(t.gameDeleted);
      } else {
        alert(data.error || t.error);
      }
    } catch (error) {
      console.error('Error deleting game:', error);
      alert(t.error);
    } finally {
      setDeleting(null);
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl glow-text">{t.loading}</div>
      </div>
    );
  }

  const renderGameForm = (game: Game | null, isCreate: boolean) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-bg-secondary/80 backdrop-blur-sm rounded-2xl p-6 border border-accent/20"
    >
      <h2 className="text-2xl font-bold glow-text mb-6">
        {isCreate ? t.createGame : t.editGame}
      </h2>
      <form onSubmit={isCreate ? handleCreate : handleUpdate} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-text-secondary">
              {t.gameName} *
            </label>
            <input
              type="text"
              name="name"
              defaultValue={game?.name || ''}
              className="w-full px-4 py-2 bg-bg-tertiary border border-accent/30 rounded-lg text-text-primary focus:outline-none focus:border-accent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-text-secondary">
              {t.gameNameEn} *
            </label>
            <input
              type="text"
              name="nameEn"
              defaultValue={game?.nameEn || ''}
              className="w-full px-4 py-2 bg-bg-tertiary border border-accent/30 rounded-lg text-text-primary focus:outline-none focus:border-accent"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-text-secondary">
            {t.description} *
          </label>
          <textarea
            name="description"
            defaultValue={game?.description || ''}
            rows={3}
            className="w-full px-4 py-2 bg-bg-tertiary border border-accent/30 rounded-lg text-text-primary focus:outline-none focus:border-accent"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-text-secondary">
              {t.minPlayers} *
            </label>
            <input
              type="number"
              name="minPlayers"
              defaultValue={game?.minPlayers || 2}
              min="1"
              className="w-full px-4 py-2 bg-bg-tertiary border border-accent/30 rounded-lg text-text-primary focus:outline-none focus:border-accent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-text-secondary">
              {t.maxPlayers} *
            </label>
            <input
              type="number"
              name="maxPlayers"
              defaultValue={game?.maxPlayers || 10}
              min="1"
              className="w-full px-4 py-2 bg-bg-tertiary border border-accent/30 rounded-lg text-text-primary focus:outline-none focus:border-accent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-text-secondary">
              {t.duration} *
            </label>
            <input
              type="number"
              name="duration"
              defaultValue={game?.duration || 30}
              min="1"
              className="w-full px-4 py-2 bg-bg-tertiary border border-accent/30 rounded-lg text-text-primary focus:outline-none focus:border-accent"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-text-secondary">
              {t.category} *
            </label>
            <input
              type="text"
              name="category"
              defaultValue={game?.category || ''}
              className="w-full px-4 py-2 bg-bg-tertiary border border-accent/30 rounded-lg text-text-primary focus:outline-none focus:border-accent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-text-secondary">
              {t.difficulty} *
            </label>
            <select
              name="difficulty"
              defaultValue={game?.difficulty || 'medium'}
              className="w-full px-4 py-2 bg-bg-tertiary border border-accent/30 rounded-lg text-text-primary focus:outline-none focus:border-accent"
              required
            >
              <option value="easy">{t.easy}</option>
              <option value="medium">{t.medium}</option>
              <option value="hard">{t.hard}</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-text-secondary">
            {t.rules} *
          </label>
          <textarea
            name="rules"
            defaultValue={game?.rules || ''}
            rows={4}
            className="w-full px-4 py-2 bg-bg-tertiary border border-accent/30 rounded-lg text-text-primary focus:outline-none focus:border-accent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-text-secondary">
            {t.tips}
          </label>
          <textarea
            name="tips"
            defaultValue={game?.tips || ''}
            rows={2}
            className="w-full px-4 py-2 bg-bg-tertiary border border-accent/30 rounded-lg text-text-primary focus:outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-text-secondary">
            {t.materials}
          </label>
          <input
            type="text"
            name="materials"
            defaultValue={game?.materials || ''}
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
            {saving ? t.saving : isCreate ? t.createGame : t.save}
          </motion.button>
          <motion.button
            type="button"
            onClick={() => {
              setEditingGame(null);
              setCreatingGame(false);
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-2 bg-bg-tertiary hover:bg-bg-tertiary/80 text-text-primary font-semibold rounded-lg transition-all duration-200 border border-accent/20"
          >
            {t.cancel}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );

  return (
    <div className="min-h-screen p-4 md:p-8 relative z-10">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold glow-text">{t.gameManagement}</h1>
            {!editingGame && !creatingGame && (
              <motion.button
                onClick={() => setCreatingGame(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-accent hover:bg-accent-glow text-white font-semibold rounded-lg transition-all duration-200 glow"
              >
                + {t.createGame}
              </motion.button>
            )}
          </div>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-2xl glow-text">{t.loading}</div>
          </div>
        ) : (
          <>
            {creatingGame && renderGameForm(null, true)}
            {editingGame && renderGameForm(editingGame, false)}
            {!editingGame && !creatingGame && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-bg-secondary/80 backdrop-blur-sm rounded-2xl p-6 border border-accent/20"
              >
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-accent/20">
                        <th className="text-right p-4 text-text-secondary">{language === 'fa' ? 'نام' : 'Name'}</th>
                        <th className="text-right p-4 text-text-secondary">{t.players}</th>
                        <th className="text-right p-4 text-text-secondary">{t.category}</th>
                        <th className="text-right p-4 text-text-secondary">{t.actions}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {games.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-text-secondary">
                            {t.noGames}
                          </td>
                        </tr>
                      ) : (
                        games.map((game, index) => (
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
                              {game.minPlayers} - {game.maxPlayers} {t.players}
                            </td>
                            <td className="p-4">{game.category}</td>
                            <td className="p-4">
                              <div className="flex gap-2">
                                <motion.button
                                  onClick={() => setEditingGame(game)}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="px-4 py-2 bg-accent/20 hover:bg-accent/30 text-accent rounded-lg transition-all duration-200"
                                >
                                  {t.edit}
                                </motion.button>
                                <motion.button
                                  onClick={() => handleDelete(game.id)}
                                  disabled={deleting === game.id}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-all duration-200 disabled:opacity-50"
                                >
                                  {deleting === game.id ? t.deleting : t.delete}
                                </motion.button>
                              </div>
                            </td>
                          </motion.tr>
                        ))
                      )}
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

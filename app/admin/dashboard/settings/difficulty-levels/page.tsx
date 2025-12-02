'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DeleteModal from '@/components/DeleteModal';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { useLanguageStore } from '@/lib/store/language-store';
import { translations } from '@/lib/translations';
import { useNotificationStore } from '@/lib/store/notification-store';

interface DifficultyLevel {
  id: string;
  nameFa: string;
  nameEn: string;
  value: string;
}

export default function DifficultyLevelsSettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const { language } = useLanguageStore();
  const t = translations[language];
  const { addNotification } = useNotificationStore();

  const [items, setItems] = useState<DifficultyLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<DifficultyLevel | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<DifficultyLevel | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchItems();
    }
  }, [isAuthenticated, user]);

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/admin/settings/difficulty-levels');
      const data = await res.json();
      if (data.success) {
        setItems(data.items);
      }
    } catch (error) {
      console.error('Error fetching difficulty levels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setSaving(true);

    try {
      const formData = new FormData(form);
      const payload = {
        nameFa: formData.get('nameFa') as string,
        nameEn: formData.get('nameEn') as string,
        value: formData.get('value') as string,
      };

      const isEdit = Boolean(editingItem);
      const res = await fetch('/api/admin/settings/difficulty-levels', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEdit ? { id: editingItem!.id, ...payload } : payload),
      });

      const data = await res.json();
      if (data.success) {
        // اول UI را به حالت پایدار برگردان، بعد سعی کن لیست را ریفرش کنی
        setEditingItem(null);
        form.reset();
        setIsModalOpen(false);
        try {
          await fetchItems();
        } catch (err) {
          console.error('Error refreshing difficulty levels after save:', err);
        }
        addNotification({
          type: 'success',
          message: isEdit ? t.itemUpdated : t.itemCreated,
        });
      } else {
        addNotification({
          type: 'error',
          message: data.error || t.error,
        });
      }
    } catch (error) {
      console.error('Error saving difficulty level:', error);
      addNotification({
        type: 'error',
        message: t.error,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (item: DifficultyLevel) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    setDeletingId(itemToDelete.id);

    try {
      const res = await fetch(`/api/admin/settings/difficulty-levels?id=${itemToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setItems((prev) => prev.filter((x) => x.id !== itemToDelete.id));
        setDeleteModalOpen(false);
        setItemToDelete(null);
        addNotification({
          type: 'success',
          message: t.itemDeleted,
        });
      } else {
        addNotification({
          type: 'error',
          message: data.error || t.error,
        });
      }
    } catch (error) {
      console.error('Error deleting difficulty level:', error);
      addNotification({
        type: 'error',
        message: t.error,
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl glow-text">{t.loading}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 relative z-10">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 md:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <h1 className="text-2xl md:text-4xl font-bold glow-text">
            {t.difficultyLevelManagement}
          </h1>
          <motion.button
            onClick={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 md:px-6 md:py-3 text-sm md:text-base bg-accent hover:bg-accent-glow text-white font-semibold rounded-lg transition-all duration-200 glow"
          >
            + {t.create}
          </motion.button>
        </motion.div>

        {/* Table List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-bg-secondary/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-accent/20"
        >
          {loading ? (
            <div className="text-center py-8 text-text-secondary">{t.loading}</div>
          ) : items.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">{t.noGames}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-accent/20">
                    <th className="p-3 text-right text-text-secondary">{t.nameFa}</th>
                    <th className="p-3 text-right text-text-secondary">{t.nameEn}</th>
                    <th className="p-3 text-right text-text-secondary">value</th>
                    <th className="p-3 text-right text-text-secondary">{t.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="border-b border-accent/10 hover:bg-bg-tertiary/50 transition-colors"
                    >
                      <td className="p-3">
                        <span className="font-semibold text-text-primary">{item.nameFa}</span>
                      </td>
                      <td className="p-3 text-text-secondary">{item.nameEn}</td>
                      <td className="p-3 text-text-secondary">
                        <span className="font-mono text-xs">{item.value}</span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setEditingItem(item);
                              setIsModalOpen(true);
                            }}
                            className="px-3 py-1 text-sm bg-accent/20 hover:bg-accent/30 text-accent rounded-lg transition-all duration-200"
                          >
                            {t.edit}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDeleteClick(item)}
                            className="px-3 py-1 text-sm bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-all duration-200"
                          >
                            {t.delete}
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => {
              if (!saving) {
                setIsModalOpen(false);
                setEditingItem(null);
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-bg-secondary/95 backdrop-blur-md rounded-xl md:rounded-2xl border border-accent/30 shadow-2xl"
            >
              <div className="p-4 md:p-6 border-b border-accent/20 flex items-center justify-between">
                <h2 className="text-lg md:text-xl font-bold glow-text">
                  {editingItem ? t.update : t.create}
                </h2>
                <button
                  onClick={() => {
                    if (!saving) {
                      setIsModalOpen(false);
                      setEditingItem(null);
                    }
                  }}
                  className="text-text-secondary hover:text-text-primary transition-colors"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-text-secondary">
                      {t.nameFa} *
                    </label>
                    <input
                      type="text"
                      name="nameFa"
                      defaultValue={editingItem?.nameFa || ''}
                      className="w-full px-4 py-2 bg-bg-tertiary border border-accent/30 rounded-lg text-text-primary focus:outline-none focus:border-accent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-text-secondary">
                      {t.nameEn} *
                    </label>
                    <input
                      type="text"
                      name="nameEn"
                      defaultValue={editingItem?.nameEn || ''}
                      className="w-full px-4 py-2 bg-bg-tertiary border border-accent/30 rounded-lg text-text-primary focus:outline-none focus:border-accent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-text-secondary">
                      value *
                    </label>
                    <input
                      type="text"
                      name="value"
                      defaultValue={editingItem?.value || ''}
                      placeholder="easy / medium / hard"
                      className="w-full px-4 py-2 bg-bg-tertiary border border-accent/30 rounded-lg text-text-primary focus:outline-none focus:border-accent"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <motion.button
                    type="button"
                    onClick={() => {
                      if (!saving) {
                        setIsModalOpen(false);
                        setEditingItem(null);
                      }
                    }}
                    whileHover={{ scale: saving ? 1 : 1.02 }}
                    whileTap={{ scale: saving ? 1 : 0.98 }}
                    className="px-4 md:px-6 py-2 text-sm md:text-base bg-bg-tertiary hover:bg-bg-tertiary/80 text-text-primary font-semibold rounded-lg transition-all duration-200 border border-accent/20 disabled:opacity-50"
                    disabled={saving}
                  >
                    {t.cancel}
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={saving}
                    whileHover={{ scale: saving ? 1 : 1.02 }}
                    whileTap={{ scale: saving ? 1 : 0.98 }}
                    className="px-4 md:px-6 py-2 text-sm md:text-base bg-accent hover:bg-accent-glow text-white font-semibold rounded-lg transition-all duration-200 glow disabled:opacity-50"
                  >
                    {saving ? t.saving : editingItem ? t.update : t.create}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          if (!deletingId) {
            setDeleteModalOpen(false);
            setItemToDelete(null);
          }
        }}
        onConfirm={handleDeleteConfirm}
        title={t.delete}
        message={language === 'fa'
          ? 'آیا مطمئن هستید که می‌خواهید این سطح دشواری را حذف کنید؟'
          : 'Are you sure you want to delete this difficulty level?'}
        confirmText={t.delete}
        cancelText={t.cancel}
        isLoading={deletingId !== null}
      />
    </div>
  );
}



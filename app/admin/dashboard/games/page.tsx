'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import { useAuthStore } from '@/lib/store/auth-store';
import { useLanguageStore } from '@/lib/store/language-store';
import { translations } from '@/lib/translations';
import DeleteModal from '@/components/DeleteModal';
import { useNotificationStore } from '@/lib/store/notification-store';
import { Switch } from '@/components/ui/switch';
import { Select, type SelectOption } from '@/components/ui/select';
import AdminSearchInput from '@/components/AdminSearchInput';

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
  isActive: boolean;
  difficultyLevelId?: string | null;
}

interface DifficultyLevelOption {
  id: string;
  nameFa: string;
  nameEn: string;
  value: string;
}

interface CategoryOption {
  id: string;
  nameFa: string;
  nameEn: string;
}

interface RequiredItemOption {
  id: string;
  nameFa: string;
  nameEn: string;
}

export default function GamesPage() {
  const router = useRouter();
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const { language, isRTL } = useLanguageStore();
  const t = translations[language];
  const { addNotification } = useNotificationStore();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [creatingGame, setCreatingGame] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [gameToDelete, setGameToDelete] = useState<Game | null>(null);
  const [togglingActive, setTogglingActive] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<'players' | 'category' | 'rating' | 'status' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFileName, setImportFileName] = useState<string | null>(null);
  const [importPreviewCount, setImportPreviewCount] = useState<number | null>(null);
  const [importRows, setImportRows] = useState<any[] | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const [difficultyOptions, setDifficultyOptions] = useState<DifficultyLevelOption[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [requiredItemOptions, setRequiredItemOptions] = useState<RequiredItemOption[]>([]);

  // Helper برای ساخت گزینه‌های استاندارد react-select
  const categorySelectOptions: SelectOption[] = categoryOptions.map((cat) => ({
    value: cat.id,
    label: language === 'fa' ? cat.nameFa : cat.nameEn,
  }));

  const requiredItemSelectOptions: SelectOption[] = requiredItemOptions.map((item) => ({
    value: item.id,
    label: language === 'fa' ? item.nameFa : item.nameEn,
  }));

  function CategoryMultiSelectField({
    name,
    initialCategoryName,
  }: {
    name: string;
    initialCategoryName?: string;
  }) {
    const [selected, setSelected] = useState<SelectOption[]>(() => {
      if (!initialCategoryName) return [];

      // ممکن است category شامل چند دسته با جداکننده «،» یا «,» باشد
      const parts = initialCategoryName
        .split(/،|,/)
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      const matches: SelectOption[] = [];
      for (const part of parts) {
        const match = categorySelectOptions.find((o) => o.label === part);
        if (match && !matches.find((m) => m.value === match.value)) {
          matches.push(match);
        }
      }

      return matches;
    });

    return (
      <>
        <Select
          isMulti
          options={categorySelectOptions}
          value={selected}
          onChange={(value) => {
            setSelected((value || []) as SelectOption[]);
          }}
          placeholder={language === 'fa' ? 'انتخاب دسته‌بندی...' : 'Select categories...'}
        />
        {selected.map((opt) => (
          <input key={opt.value} type="hidden" name={name} value={opt.value} />
        ))}
      </>
    );
  }

  function RequiredItemsMultiSelectField({
    name,
    initialMaterials,
  }: {
    name: string;
    initialMaterials?: string;
  }) {
    const [selected, setSelected] = useState<SelectOption[]>(() => {
      if (!initialMaterials) return [];
      const parts = initialMaterials
        .split(/،|,/)
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      const matches: SelectOption[] = [];
      for (const part of parts) {
        const match = requiredItemSelectOptions.find((o) => o.label === part);
        if (match && !matches.find((m) => m.value === match.value)) {
          matches.push(match);
        }
      }
      return matches;
    });

    return (
      <>
        <Select
          isMulti
          options={requiredItemSelectOptions}
          value={selected}
          onChange={(value) => {
            setSelected((value || []) as SelectOption[]);
          }}
          placeholder={language === 'fa' ? 'انتخاب موارد مورد نیاز...' : 'Select materials...'}
        />
        {selected.map((opt) => (
          <input key={opt.value} type="hidden" name={name} value={opt.value} />
        ))}
      </>
    );
  }

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchGames();
      fetchSettingsOptions();
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

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) {
        params.set('search', searchQuery.trim());
      }

      const res = await fetch(`/api/admin/games/export?${params.toString()}`, {
        method: 'GET',
      });

      if (!res.ok) {
        addNotification({
          type: 'error',
          message: language === 'fa' ? 'خطا در Export بازی‌ها' : 'Failed to export games',
        });
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `games-export-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      addNotification({
        type: 'error',
        message: language === 'fa' ? 'خطا در Export بازی‌ها' : 'Failed to export games',
      });
    }
  };

  const handleImportFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonRows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

      setImportFileName(file.name);
      setImportPreviewCount(jsonRows.length);
      setImportRows(jsonRows as any[]);
    } catch (error) {
      console.error('Import parse error:', error);
      addNotification({
        type: 'error',
        message: language === 'fa' ? 'خطا در خواندن فایل Excel' : 'Failed to read Excel file',
      });
      setImportFileName(null);
      setImportPreviewCount(null);
      setImportRows(null);
    }
  };

  const handleConfirmImport = async () => {
    if (!importRows || importRows.length === 0) {
      addNotification({
        type: 'error',
        message: language === 'fa' ? 'فایل خالی است' : 'File is empty',
      });
      return;
    }

    setIsImporting(true);

    try {
      const res = await fetch('/api/admin/games/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: importRows }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        addNotification({
          type: 'error',
          message: data.error || (language === 'fa' ? 'خطا در Import بازی‌ها' : 'Failed to import games'),
        });
        return;
      }

      const created = data.created ?? 0;
      const updated = data.updated ?? 0;
      const skipped = data.skipped ?? 0;

      addNotification({
        type: 'success',
        message:
          language === 'fa'
            ? `Import انجام شد. ایجاد: ${created}، به‌روزرسانی: ${updated}، رد شده: ${skipped}`
            : `Import completed. Created: ${created}, Updated: ${updated}, Skipped: ${skipped}`,
      });

      setIsImportModalOpen(false);
      setImportFileName(null);
      setImportPreviewCount(null);
      setImportRows(null);

      await fetchGames();
    } catch (error) {
      console.error('Import request error:', error);
      addNotification({
        type: 'error',
        message: language === 'fa' ? 'خطا در Import بازی‌ها' : 'Failed to import games',
      });
    } finally {
      setIsImporting(false);
    }
  };

  const fetchSettingsOptions = async () => {
    try {
      const [dRes, cRes, rRes] = await Promise.all([
        fetch('/api/admin/settings/difficulty-levels'),
        fetch('/api/admin/settings/categories'),
        fetch('/api/admin/settings/required-items'),
      ]);

      const dData = await dRes.json();
      const cData = await cRes.json();
      const rData = await rRes.json();

      if (dData.success) setDifficultyOptions(dData.items);
      if (cData.success) setCategoryOptions(cData.items);
      if (rData.success) setRequiredItemOptions(rData.items);
    } catch (error) {
      console.error('Error fetching settings options:', error);
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
        difficultyLevelId: formData.get('difficultyLevelId') as string || undefined,
        duration: parseInt(formData.get('duration') as string),
        materials: formData.get('materials') as string || undefined,
        categoryIds: formData.getAll('categoryIds') as string[],
        requiredItemIds: formData.getAll('requiredItemIds') as string[],
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
        addNotification({
          type: 'success',
          message: t.gameCreated,
        });
      } else {
        addNotification({
          type: 'error',
          message: data.error || t.error,
        });
      }
    } catch (error) {
      console.error('Error creating game:', error);
      addNotification({
        type: 'error',
        message: 'خطا در ایجاد بازی',
      });
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
      const difficultyLevelId = formData.get('difficultyLevelId') as string | null;
      if (formData.get('duration'))
        updateData.duration = parseInt(formData.get('duration') as string);
      if (formData.get('materials'))
        updateData.materials = formData.get('materials') as string;

      const payload: any = {
        id: editingGame.id,
        ...updateData,
      };

      if (difficultyLevelId) {
        payload.difficultyLevelId = difficultyLevelId;
      }

      const categoryIds = formData.getAll('categoryIds') as string[];
      const requiredItemIds = formData.getAll('requiredItemIds') as string[];
      if (categoryIds.length > 0) payload.categoryIds = categoryIds;
      if (requiredItemIds.length > 0) payload.requiredItemIds = requiredItemIds;

      const response = await fetch('/api/admin/games', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        // ابتدا state محلی را با داده برگردانده‌شده از سرور به‌روزرسانی کن
        setGames((prev) =>
          prev.map((g) => (g.id === editingGame.id ? data.game : g))
        );

        // برای اطمینان از همگام بودن UI با دیتابیس (به‌خصوص مقادیر محاسبه‌شده مثل category/materials)
        // لیست بازی‌ها را دوباره از سرور می‌گیریم
        await fetchGames();

        setEditingGame(null);
        addNotification({
          type: 'success',
          message: t.gameUpdated,
        });
      } else {
        addNotification({
          type: 'error',
          message: data.error || t.error,
        });
      }
    } catch (error) {
      console.error('Error updating game:', error);
      addNotification({
        type: 'error',
        message: t.error,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (game: Game) => {
    setGameToDelete(game);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!gameToDelete) return;

    setDeleting(gameToDelete.id);

    try {
      const response = await fetch(`/api/admin/games?id=${gameToDelete.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setGames((prev) => prev.filter((g) => g.id !== gameToDelete.id));
        setDeleteModalOpen(false);
        setGameToDelete(null);
        addNotification({
          type: 'success',
          message: t.gameDeleted,
        });
      } else {
        addNotification({
          type: 'error',
          message: data.error || t.error,
        });
      }
    } catch (error) {
      console.error('Error deleting game:', error);
      addNotification({
        type: 'error',
        message: t.error,
      });
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleActive = async (game: Game, newValue: boolean) => {
    setTogglingActive(game.id);

    try {
      const response = await fetch('/api/admin/games', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: game.id, isActive: newValue }),
      });

      const data = await response.json();

      if (data.success) {
        setGames((prev) =>
          prev.map((g) => (g.id === game.id ? data.game : g))
        );
        addNotification({
          type: 'success',
          message: newValue ? t.gameActivated : t.gameDeactivated,
        });
      } else {
        addNotification({
          type: 'error',
          message: data.error || t.error,
        });
      }
    } catch (error) {
      console.error('Error toggling game active status:', error);
      addNotification({
        type: 'error',
        message: t.error,
      });
    } finally {
      setTogglingActive(null);
    }
  };

  // Filter games based on search query (both Persian and English names)
  const filteredGames = games.filter((game) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    return (
      game.name.toLowerCase().includes(query) ||
      game.nameEn.toLowerCase().includes(query)
    );
  });

  const sortedGames = [...filteredGames].sort((a, b) => {
    if (!sortKey) return 0;

    const dir = sortDirection === 'asc' ? 1 : -1;

    if (sortKey === 'players') {
      const aVal = a.minPlayers;
      const bVal = b.minPlayers;
      if (aVal === bVal) {
        return (a.maxPlayers - b.maxPlayers) * dir;
      }
      return (aVal - bVal) * dir;
    }

    if (sortKey === 'category') {
      const aVal = (a.category || '').toLowerCase();
      const bVal = (b.category || '').toLowerCase();
      if (aVal === bVal) return 0;
      return aVal > bVal ? dir : -dir;
    }

    if (sortKey === 'rating') {
      const aScore = (a as any).score as number | undefined;
      const bScore = (b as any).score as number | undefined;
      const aVal = typeof aScore === 'number' ? aScore : 0;
      const bVal = typeof bScore === 'number' ? bScore : 0;
      if (aVal === bVal) return 0;
      return (aVal - bVal) * dir;
    }

    if (sortKey === 'status') {
      const aVal = a.isActive ? 1 : 0;
      const bVal = b.isActive ? 1 : 0;
      if (aVal === bVal) return 0;
      return (aVal - bVal) * dir;
    }

    return 0;
  });

  const handleSort = (key: 'players' | 'category' | 'rating' | 'status') => {
    if (sortKey === key) {
      // اگر روی همان ستون دوباره کلیک شد، جهت را برعکس کن
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      // ستون جدید → از صعودی شروع کن
      setSortKey(key);
      setSortDirection('asc');
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
      className="bg-bg-secondary/80 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 border border-accent/20"
    >
      <h2 className="text-xl md:text-2xl font-bold glow-text mb-4 md:mb-6">
        {isCreate ? t.createGame : t.editGame}
      </h2>
      <form onSubmit={isCreate ? handleCreate : handleUpdate} className="space-y-3 md:space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
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
            <CategoryMultiSelectField
              name="categoryIds"
              initialCategoryName={game?.category}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-text-secondary">
              {t.difficulty} *
            </label>
            <select
              name="difficultyLevelId"
              defaultValue={game?.difficultyLevelId ?? ''}
              className="w-full px-4 py-2 bg-bg-tertiary border border-accent/30 rounded-lg text-text-primary focus:outline-none focus:border-accent"
              required
            >
              <option value="">{language === 'fa' ? 'انتخاب کنید...' : 'Select...'}</option>
              {difficultyOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {language === 'fa' ? opt.nameFa : opt.nameEn}
                </option>
              ))}
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
          <RequiredItemsMultiSelectField
            name="requiredItemIds"
            initialMaterials={game?.materials}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
          <motion.button
            type="submit"
            disabled={saving}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 md:px-6 py-2 text-sm md:text-base bg-accent hover:bg-accent-glow text-white font-semibold rounded-lg transition-all duration-200 glow disabled:opacity-50"
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
            className="px-4 md:px-6 py-2 text-sm md:text-base bg-bg-tertiary hover:bg-bg-tertiary/80 text-text-primary font-semibold rounded-lg transition-all duration-200 border border-accent/20"
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
          className="mb-6 md:mb-8"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl md:text-4xl font-bold glow-text">{t.gameManagement}</h1>
            {!editingGame && !creatingGame && (
              <motion.button
                onClick={() => setCreatingGame(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 md:px-6 md:py-3 text-sm md:text-base bg-accent hover:bg-accent-glow text-white font-semibold rounded-lg transition-all duration-200 glow w-full sm:w-auto"
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
              <>
                {/* Search + Import/Export */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 md:mb-6 flex flex-col md:flex-row gap-3 md:gap-4 md:items-center"
                >
                  <div className="flex-1">
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={
                          language === 'fa'
                            ? 'جستجو بر اساس نام (فارسی یا انگلیسی)...'
                            : 'Search by name (Persian or English)...'
                        }
                        dir={isRTL ? 'rtl' : 'ltr'}
                        style={{
                          paddingTop: '0.75rem',
                          paddingBottom: '0.75rem',
                          ...(isRTL
                            ? searchQuery
                              ? { paddingRight: '1rem', paddingLeft: '3rem' }
                              : { paddingRight: '47px', paddingLeft: '1rem' }
                            : searchQuery
                            ? { paddingLeft: '1rem', paddingRight: '3rem' }
                            : { paddingLeft: '47px', paddingRight: '1rem' }),
                        }}
                        className="w-full bg-bg-secondary/80 backdrop-blur-sm border border-accent/30 rounded-lg text-text-primary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-200"
                      />
                      {!searchQuery && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className={`absolute top-1/2 transform -translate-y-1/2 ${
                            isRTL ? 'right-4' : 'left-4'
                          }`}
                        >
                          <svg
                            className="w-5 h-5 text-text-secondary pointer-events-none"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                        </motion.div>
                      )}
                      {searchQuery && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          onClick={() => setSearchQuery('')}
                          className={`absolute top-[35%] transform -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50 transition-all duration-200 ${
                            isRTL ? 'left-3' : 'right-3'
                          }`}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          aria-label={language === 'fa' ? 'پاک کردن' : 'Clear'}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </motion.button>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 md:gap-3 justify-end">
                    <motion.button
                      type="button"
                      onClick={handleExport}
                      whileHover={{ scale: 1.03, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      className="px-3 py-2 md:px-4 md:py-2 text-xs md:text-sm rounded-lg bg-bg-tertiary hover:bg-bg-tertiary/80 border border-accent/30 text-text-primary flex items-center gap-2 transition-all duration-200"
                    >
                      <span>⬇</span>
                      <span>{language === 'fa' ? 'Export' : 'Export'}</span>
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={() => {
                        setIsImportModalOpen(true);
                        setImportFileName(null);
                        setImportPreviewCount(null);
                        setImportRows(null);
                      }}
                      whileHover={{ scale: 1.03, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      className="px-3 py-2 md:px-4 md:py-2 text-xs md:text-sm rounded-lg bg-accent/20 hover:bg-accent/30 border border-accent/40 text-accent flex items-center gap-2 transition-all duration-200"
                    >
                      <span>⬆</span>
                      <span>{language === 'fa' ? 'Import' : 'Import'}</span>
                    </motion.button>
                  </div>
                </motion.div>

                {/* Mobile: Card View */}
                <div className="md:hidden space-y-4">
                  {filteredGames.length === 0 ? (
                    <div className="bg-bg-secondary/80 backdrop-blur-sm rounded-xl p-8 border border-accent/20 text-center text-text-secondary">
                      {searchQuery ? (language === 'fa' ? 'نتیجه‌ای یافت نشد' : 'No results found') : t.noGames}
                    </div>
                  ) : (
                    filteredGames.map((game, index) => (
                      <motion.div
                        key={game.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className="bg-bg-secondary/80 backdrop-blur-sm rounded-xl p-4 border border-accent/20"
                      >
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-semibold text-lg text-text-primary">{game.name}</div>
                            {togglingActive === game.id ? (
                              <div className="flex items-center justify-center h-6 w-11">
                                <svg
                                  className="animate-spin h-4 w-4 text-accent"
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
                              </div>
                            ) : (
                              <Switch
                                checked={game.isActive}
                                onCheckedChange={(checked: boolean) => handleToggleActive(game, checked)}
                                disabled={togglingActive === game.id}
                              />
                            )}
                          </div>
                          <div className="text-sm text-text-secondary mb-2">{game.nameEn}</div>
                          <div className="flex flex-wrap gap-2 text-sm">
                            <span className="px-2 py-1 bg-accent/20 text-accent rounded">
                              {game.minPlayers} - {game.maxPlayers} {t.players}
                            </span>
                            <span className="px-2 py-1 bg-bg-tertiary text-text-secondary rounded">
                              {game.category}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <motion.button
                              onClick={() => setEditingGame(game)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="flex-1 px-4 py-2 text-sm bg-accent/20 hover:bg-accent/30 text-accent rounded-lg transition-all duration-200"
                            >
                              {t.edit}
                            </motion.button>
                            <motion.button
                              onClick={() => handleDeleteClick(game)}
                              disabled={deleting === game.id}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="flex-1 px-4 py-2 text-sm bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-all duration-200 disabled:opacity-50"
                            >
                              {t.delete}
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
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
                          <th className="text-right p-4 text-text-secondary">{language === 'fa' ? 'نام' : 'Name'}</th>
                          <th
                            className="text-right p-4 text-text-secondary cursor-pointer select-none"
                            onClick={() => handleSort('players')}
                          >
                            {t.players}
                            {sortKey === 'players' && (
                              <span className="mr-1 text-xs">
                                {sortDirection === 'asc' ? '▲' : '▼'}
                              </span>
                            )}
                          </th>
                          <th
                            className="text-right p-4 text-text-secondary cursor-pointer select-none"
                            onClick={() => handleSort('category')}
                          >
                            {t.category}
                            {sortKey === 'category' && (
                              <span className="mr-1 text-xs">
                                {sortDirection === 'asc' ? '▲' : '▼'}
                              </span>
                            )}
                          </th>
                          <th
                            className="text-right p-4 text-text-secondary cursor-pointer select-none"
                            onClick={() => handleSort('rating')}
                          >
                            {language === 'fa' ? 'امتیاز' : 'Rating'}
                            {sortKey === 'rating' && (
                              <span className="mr-1 text-xs">
                                {sortDirection === 'asc' ? '▲' : '▼'}
                              </span>
                            )}
                          </th>
                          <th
                            className="text-right p-4 text-text-secondary cursor-pointer select-none"
                            onClick={() => handleSort('status')}
                          >
                            {language === 'fa' ? 'وضعیت' : 'Status'}
                            {sortKey === 'status' && (
                              <span className="mr-1 text-xs">
                                {sortDirection === 'asc' ? '▲' : '▼'}
                              </span>
                            )}
                          </th>
                          <th className="text-right p-4 text-text-secondary">{t.actions}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedGames.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-text-secondary">
                              {searchQuery ? (language === 'fa' ? 'نتیجه‌ای یافت نشد' : 'No results found') : t.noGames}
                            </td>
                          </tr>
                        ) : (
                          sortedGames.map((game, index) => (
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
                                {typeof (game as any).score === 'number' ? (
                                  <span className="font-semibold text-lg">
                                    {Math.round((game as any).score)}
                                    {typeof (game as any).ratingsCount === 'number' && (
                                      <span className="text-sm text-text-secondary ml-1">
                                        ({(game as any).ratingsCount})
                                      </span>
                                    )}
                                  </span>
                                ) : (
                                  <span className="text-xs text-text-secondary">
                                    {language === 'fa' ? 'بدون امتیاز' : 'No rating'}
                                  </span>
                                )}
                              </td>
                              <td className="p-4">
                                {togglingActive === game.id ? (
                                  <div className="flex items-center justify-center h-6 w-11">
                                    <svg
                                      className="animate-spin h-4 w-4 text-accent"
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
                                  </div>
                                ) : (
                                  <Switch
                                    checked={game.isActive}
                                    onCheckedChange={(checked: boolean) => handleToggleActive(game, checked)}
                                    disabled={togglingActive === game.id}
                                  />
                                )}
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-3">
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
                                      onClick={() => handleDeleteClick(game)}
                                      disabled={deleting === game.id}
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-all duration-200 disabled:opacity-50"
                                    >
                                      {t.delete}
                                    </motion.button>
                                  </div>
                                </div>
                              </td>
                            </motion.tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              </>
            )}
          </>
        )}
      </div>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          if (!deleting) {
            setDeleteModalOpen(false);
            setGameToDelete(null);
          }
        }}
        onConfirm={handleDeleteConfirm}
        title={t.deleteGame}
        message={t.deleteConfirm}
        confirmText={t.delete}
        cancelText={t.cancel}
        isLoading={deleting !== null}
      />

      {/* Import Modal */}
      <AnimatePresence>
        {isImportModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => {
              if (!isImporting) {
                setIsImportModalOpen(false);
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-bg-secondary/95 backdrop-blur-md rounded-xl md:rounded-2xl border border-accent/30 shadow-2xl"
            >
              <div className="p-4 md:p-6 border-b border-accent/20 flex items-center justify-between">
                <h2 className="text-lg md:text-xl font-bold glow-text">
                  {language === 'fa' ? 'Import بازی‌ها' : 'Import Games'}
                </h2>
                <button
                  onClick={() => {
                    if (!isImporting) setIsImportModalOpen(false);
                  }}
                  className="text-text-secondary hover:text-text-primary transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="p-4 md:p-6 space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-text-secondary">
                    {language === 'fa'
                      ? 'فایل Excel (خروجی گرفته‌شده از همین صفحه) را انتخاب کنید. رکوردها بر اساس ستون id به‌روزرسانی یا ایجاد می‌شوند.'
                      : 'Select an Excel file exported from this page. Records will be updated or created based on the id column.'}
                  </p>
                  <label className="block">
                    <span className="sr-only">Choose Excel file</span>
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleImportFileChange}
                      className="block w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-accent/20 file:text-accent hover:file:bg-accent/30 cursor-pointer"
                    />
                  </label>
                  {importFileName && (
                    <div className="mt-2 text-sm text-text-secondary">
                      <div>
                        {language === 'fa' ? 'فایل انتخاب‌شده:' : 'Selected file:'}{' '}
                        <span className="font-semibold text-text-primary">{importFileName}</span>
                      </div>
                      {importPreviewCount !== null && (
                        <div>
                          {language === 'fa'
                            ? `تعداد ردیف‌ها: ${importPreviewCount}`
                            : `Rows: ${importPreviewCount}`}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-red-300">
                    {language === 'fa'
                      ? 'هشدار: این عملیات می‌تواند اطلاعات بازی‌ها را بر اساس id جایگزین کند.'
                      : 'Warning: This operation can replace game data based on id.'}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {language === 'fa'
                      ? 'اگر برای یک id بازی وجود داشته باشد، تمام فیلدهایی که در فایل وجود دارند با مقادیر جدید جایگزین می‌شوند. اگر id جدید باشد، بازی جدیدی ایجاد می‌شود.'
                      : 'If a game with a given id exists, all fields present in the file will be updated. If the id is new, a new game will be created.'}
                  </p>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <motion.button
                    type="button"
                    disabled={isImporting}
                    onClick={() => {
                      if (!isImporting) setIsImportModalOpen(false);
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 md:px-6 py-2 text-sm md:text-base bg-bg-tertiary hover:bg-bg-tertiary/80 text-text-primary font-semibold rounded-lg transition-all duration-200 border border-accent/20 disabled:opacity-50"
                  >
                    {t.cancel}
                  </motion.button>
                  <motion.button
                    type="button"
                    disabled={isImporting || !importRows || importRows.length === 0}
                    onClick={handleConfirmImport}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 md:px-6 py-2 text-sm md:text-base bg-accent hover:bg-accent-glow text-white font-semibold rounded-lg transition-all duration-200 glow disabled:opacity-50"
                  >
                    {isImporting
                      ? language === 'fa'
                        ? 'در حال Import...'
                        : 'Importing...'
                      : language === 'fa'
                      ? 'بله، Import کن'
                      : 'Yes, import'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

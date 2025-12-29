'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import { useNotificationStore } from '@/lib/store/notification-store';

// Keep for backward compatibility
export type SettingsType = 'category' | 'requiredItem' | 'difficultyLevel';

interface AdminImportExportProps {
  type: string;                 // Generic string type (can be any string)
  exportApiPath: string;
  importApiPath: string;
  searchQuery: string;
  onRefresh: () => void;
  language: 'fa' | 'en';
}

// Default type labels for known types
const defaultTypeLabels: Record<string, { fa: string; en: string }> = {
  category: { fa: 'دسته‌بندی', en: 'Category' },
  requiredItem: { fa: 'مورد مورد نیاز', en: 'Required Item' },
  difficultyLevel: { fa: 'سطح دشواری', en: 'Difficulty Level' },
};

// Helper function to get type label with fallback
const getTypeLabel = (type: string, language: 'fa' | 'en'): string => {
  const label = defaultTypeLabels[type];
  if (label) {
    return label[language];
  }
  // Fallback: capitalize first letter and return as-is
  return type.charAt(0).toUpperCase() + type.slice(1);
};

export default function AdminImportExport({
  type,
  exportApiPath,
  importApiPath,
  searchQuery,
  onRefresh,
  language,
}: AdminImportExportProps) {
  const { addNotification } = useNotificationStore();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFileName, setImportFileName] = useState<string | null>(null);
  const [importPreviewCount, setImportPreviewCount] = useState<number | null>(null);
  const [importRows, setImportRows] = useState<any[] | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [overwriteExisting, setOverwriteExisting] = useState(false);

  const typeLabel = getTypeLabel(type, language);
  const isFa = language === 'fa';

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) {
        params.set('search', searchQuery.trim());
      }

      const res = await fetch(`${exportApiPath}?${params.toString()}`, {
        method: 'GET',
      });

      if (!res.ok) {
        addNotification({
          type: 'error',
          message: isFa ? `خطا در Export ${typeLabel}ها` : `Failed to export ${typeLabel}s`,
        });
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-export-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      addNotification({
        type: 'error',
        message: isFa ? `خطا در Export ${typeLabel}ها` : `Failed to export ${typeLabel}s`,
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
        message: isFa ? 'خطا در خواندن فایل Excel' : 'Failed to read Excel file',
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
        message: isFa ? 'فایل خالی است' : 'File is empty',
      });
      return;
    }

    setIsImporting(true);

    try {
      const res = await fetch(importApiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          rows: importRows,
          overwrite: overwriteExisting,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        addNotification({
          type: 'error',
          message: data.error || (isFa ? `خطا در Import ${typeLabel}ها` : `Failed to import ${typeLabel}s`),
        });
        return;
      }

      const created = data.created ?? 0;
      const updated = data.updated ?? 0;
      const skipped = data.skipped ?? 0;

      addNotification({
        type: 'success',
        message: isFa
          ? `Import انجام شد. ایجاد: ${created}، به‌روزرسانی: ${updated}، رد شده: ${skipped}`
          : `Import completed. Created: ${created}, Updated: ${updated}, Skipped: ${skipped}`,
      });

      setIsImportModalOpen(false);
      setImportFileName(null);
      setImportPreviewCount(null);
      setImportRows(null);
      setOverwriteExisting(false);

      onRefresh();
    } catch (error) {
      console.error('Import request error:', error);
      addNotification({
        type: 'error',
        message: isFa ? `خطا در Import ${typeLabel}ها` : `Failed to import ${typeLabel}s`,
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <>
      <div className="flex gap-2 md:gap-3 justify-end">
        <motion.button
          type="button"
          onClick={handleExport}
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97 }}
          className="px-3 py-2 md:px-4 md:py-2 text-xs md:text-sm rounded-lg bg-bg-tertiary hover:bg-bg-tertiary/80 border border-accent/30 text-text-primary flex items-center gap-2 transition-all duration-200"
        >
          <span>⬇</span>
          <span>Export</span>
        </motion.button>
        <motion.button
          type="button"
          onClick={() => {
            setIsImportModalOpen(true);
            setImportFileName(null);
            setImportPreviewCount(null);
            setImportRows(null);
            setOverwriteExisting(false);
          }}
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97 }}
          className="px-3 py-2 md:px-4 md:py-2 text-xs md:text-sm rounded-lg bg-accent/20 hover:bg-accent/30 border border-accent/40 text-accent flex items-center gap-2 transition-all duration-200"
        >
          <span>⬆</span>
          <span>Import</span>
        </motion.button>
      </div>

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
                setImportFileName(null);
                setImportPreviewCount(null);
                setImportRows(null);
                setOverwriteExisting(false);
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
                  {isFa ? `Import ${typeLabel}ها` : `Import ${typeLabel}s`}
                </h2>
                <button
                  onClick={() => {
                    if (!isImporting) {
                      setIsImportModalOpen(false);
                      setImportFileName(null);
                      setImportPreviewCount(null);
                      setImportRows(null);
                      setOverwriteExisting(false);
                    }
                  }}
                  className="text-text-secondary hover:text-text-primary transition-colors"
                  disabled={isImporting}
                >
                  ✕
                </button>
              </div>
              <div className="p-4 md:p-6 space-y-4">
                {!importFileName ? (
                  <>
                    <p className="text-text-secondary text-center">
                      {isFa ? 'فایل Excel را انتخاب کنید' : 'Select Excel file'}
                    </p>
                    <label className="block">
                      <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleImportFileChange}
                        className="hidden"
                        disabled={isImporting}
                      />
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full px-4 py-3 bg-bg-tertiary border border-accent/30 rounded-lg text-center cursor-pointer hover:bg-bg-tertiary/80 transition-all duration-200"
                      >
                        <span className="text-text-primary">
                          {isFa ? 'انتخاب فایل...' : 'Choose file...'}
                        </span>
                      </motion.div>
                    </label>
                  </>
                ) : (
                  <>
                    <div className="text-center space-y-2">
                      <p className="text-text-secondary">
                        {isFa ? 'فایل:' : 'File:'}{' '}
                        <span className="font-semibold text-text-primary">{importFileName}</span>
                      </p>
                      {importPreviewCount !== null && (
                        <p className="text-text-secondary">
                          {isFa
                            ? `این فایل حاوی ${importPreviewCount} ردیف است.`
                            : `This file contains ${importPreviewCount} rows.`}
                        </p>
                      )}
                      <div className="mt-4 space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={overwriteExisting}
                            onChange={(e) => setOverwriteExisting(e.target.checked)}
                            className="w-5 h-5 rounded border-accent/30 bg-bg-tertiary text-accent focus:ring-2 focus:ring-accent/50 focus:ring-offset-2 focus:ring-offset-bg-secondary cursor-pointer transition-all duration-200"
                            disabled={isImporting}
                          />
                          <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                            {isFa
                              ? 'بازنویسی رکوردهای موجود (Overwrite existing records)'
                              : 'Overwrite existing records'}
                          </span>
                        </label>
                        <p className="text-xs text-text-secondary/80">
                          {isFa
                            ? overwriteExisting
                              ? 'رکوردهای موجود با داده‌های Excel بازنویسی می‌شوند.'
                              : 'فقط رکوردهای جدید اضافه می‌شوند. رکوردهای موجود تغییر نمی‌کنند.'
                            : overwriteExisting
                            ? 'Existing records will be overwritten with Excel data.'
                            : 'Only new records will be added. Existing records will not be changed.'}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <motion.button
                        type="button"
                        onClick={() => {
                          if (!isImporting) {
                            setIsImportModalOpen(false);
                            setImportFileName(null);
                            setImportPreviewCount(null);
                            setImportRows(null);
                            setOverwriteExisting(false);
                          }
                        }}
                        whileHover={{ scale: isImporting ? 1 : 1.02 }}
                        whileTap={{ scale: isImporting ? 1 : 0.98 }}
                        className="px-4 md:px-6 py-2 text-sm md:text-base bg-bg-tertiary hover:bg-bg-tertiary/80 text-text-primary font-semibold rounded-lg transition-all duration-200 border border-accent/20 disabled:opacity-50"
                        disabled={isImporting}
                      >
                        {isFa ? 'لغو' : 'Cancel'}
                      </motion.button>
                      <motion.button
                        type="button"
                        onClick={handleConfirmImport}
                        disabled={isImporting}
                        whileHover={{ scale: isImporting ? 1 : 1.02 }}
                        whileTap={{ scale: isImporting ? 1 : 0.98 }}
                        className="px-4 md:px-6 py-2 text-sm md:text-base bg-accent hover:bg-accent-glow text-white font-semibold rounded-lg transition-all duration-200 glow disabled:opacity-50"
                      >
                        {isImporting
                          ? (isFa ? 'در حال Import...' : 'Importing...')
                          : isFa
                          ? 'بله مطمئنم'
                          : 'Yes, confirm'}
                      </motion.button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}


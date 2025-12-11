'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLanguageStore } from '@/lib/store/language-store';
import { useAuthStore } from '@/lib/store/auth-store';
import { translations } from '@/lib/translations';
import BaseData from '@/components/admin/BaseData';
import { motion } from 'framer-motion';

interface DatasetInfo {
  id: string;
  nameFa: string;
  nameEn: string;
}

export default function DatasetItemsSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const { language } = useLanguageStore();
  const { user, isAuthenticated } = useAuthStore();
  const t = translations[language];
  const datasetId = params?.datasetId as string;

  const [datasetInfo, setDatasetInfo] = useState<DatasetInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (datasetId && isAuthenticated && user?.role === 'admin') {
      fetchDatasetInfo();
    }
  }, [datasetId, isAuthenticated, user]);

  const fetchDatasetInfo = async () => {
    try {
      const res = await fetch(`/api/admin/settings/datasets/${datasetId}`);
      const data = await res.json();
      if (data.success && data.dataset) {
        setDatasetInfo(data.dataset);
      }
    } catch (error) {
      console.error('Error fetching dataset info:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl glow-text">{t.loading}</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl glow-text">{t.loading}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 relative z-10">
      <div className="max-w-5xl mx-auto">
        {datasetInfo && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-bg-secondary/80 backdrop-blur-sm rounded-xl border border-accent/20"
          >
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => router.push('/admin/dashboard/settings/datasets')}
                className="text-accent hover:text-accent-glow transition-colors"
              >
                ← {language === 'fa' ? 'بازگشت به لیست Dataset‌ها' : 'Back to Datasets'}
              </button>
            </div>
            <h2 className="text-xl md:text-2xl font-bold glow-text">
              {language === 'fa' ? 'Dataset:' : 'Dataset:'} {datasetInfo.nameFa} ({datasetInfo.nameEn})
            </h2>
          </motion.div>
        )}

        <BaseData
          apiPath={`/api/admin/settings/datasets/${datasetId}`}
          exportApiPath={`/api/admin/settings/datasets/${datasetId}/export`}
          importApiPath={`/api/admin/settings/datasets/${datasetId}/import`}
          baseName="datasetItem"
          deleteMessage={
            language === 'fa'
              ? 'آیا مطمئن هستید که می‌خواهید این آیتم Dataset را حذف کنید؟'
              : 'Are you sure you want to delete this Dataset item?'
          }
        />
      </div>
    </div>
  );
}


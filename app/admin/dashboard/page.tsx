'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/store/auth-store';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface DashboardStats {
  totalGames: number;
  totalUsers: number;
  totalFavorites: number;
  usersLast7Days: number;
  usersLast30Days: number;
  usersLast90Days: number;
  dailyUserStats: Array<{ date: string; count: number }>;
  monthlyUserStats: Array<{ month: string; monthShort: string; count: number }>;
  usersByRole: Array<{ role: string; count: number }>;
  gamesByCategory: Array<{ category: string; count: number }>;
  popularGames: Array<{
    gameId: string;
    gameName: string;
    gameNameEn: string;
    favoritesCount: number;
  }>;
  favoritesByCategory: Array<{ category: string; count: number }>;
}

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

type ChartFilter = '7days' | '30days' | '90days' | '12months';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, checkAuth, logout } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartFilter, setChartFilter] = useState<ChartFilter>('30days');
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  const fetchStats = useCallback(async () => {
    // جلوگیری از درخواست‌های تکراری
    if (hasFetchedRef.current) {
      return;
    }

    hasFetchedRef.current = true;
    
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      hasFetchedRef.current = false; // در صورت خطا، اجازه retry بده
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin' && !hasFetchedRef.current) {
      fetchStats();
    }
  }, [isAuthenticated, user, fetchStats]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
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
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
            <h1 className="text-2xl md:text-4xl font-bold glow-text">پنل مدیریت</h1>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <span className="text-sm md:text-base text-text-secondary">خوش آمدید، {user.phone}</span>
              <motion.button
                onClick={handleLogout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 text-sm md:text-base bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-300 transition-all duration-200 w-full sm:w-auto"
              >
                خروج
              </motion.button>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-xl md:text-2xl glow-text">در حال بارگذاری آمار...</div>
          </div>
        ) : stats ? (
          <>
            {/* آمار کلی */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-bg-secondary/80 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-accent/20"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm md:text-base text-text-secondary">کل بازی‌ها</h3>
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-2xl md:text-3xl font-bold glow-text">{stats.totalGames}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-bg-secondary/80 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-accent/20"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm md:text-base text-text-secondary">کل کاربران</h3>
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-2xl md:text-3xl font-bold glow-text">{stats.totalUsers}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-bg-secondary/80 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-accent/20"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm md:text-base text-text-secondary">کل Favorites</h3>
                  <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-pink-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </div>
                </div>
                <p className="text-2xl md:text-3xl font-bold glow-text">{stats.totalFavorites}</p>
              </motion.div>
            </div>

            {/* نمودارها */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
              {/* نمودار کاربران با فیلتر (7 روز، 30 روز، 90 روز، 12 ماه) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-bg-secondary/80 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 border border-accent/20"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <h3 className="text-lg md:text-xl font-bold glow-text">کاربران جدید</h3>
                  <div className="flex flex-wrap gap-2">
                    {(['7days', '30days', '90days', '12months'] as ChartFilter[]).map((filter) => {
                      const labels = {
                        '7days': '۷ روز',
                        '30days': '۳۰ روز',
                        '90days': '۹۰ روز',
                        '12months': '۱۲ ماه',
                      };
                      const isActive = chartFilter === filter;
                      return (
                        <motion.button
                          key={filter}
                          onClick={() => setChartFilter(filter)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 ${
                            isActive
                              ? 'bg-accent text-bg-primary font-semibold'
                              : 'bg-bg-tertiary/50 text-text-secondary hover:bg-bg-tertiary'
                          }`}
                        >
                          {labels[filter]}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  {chartFilter === '12months' ? (
                    <BarChart data={stats.monthlyUserStats}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#8b5cf6" opacity={0.2} />
                      <XAxis 
                        dataKey="monthShort" 
                        tick={{ fill: '#9ca3af', fontSize: 10 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(17, 24, 39, 0.9)', 
                          border: '1px solid #8b5cf6',
                          borderRadius: '8px',
                          color: '#fff'
                        }}
                        labelFormatter={(value) => value}
                      />
                      <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  ) : (
                    <LineChart
                      data={
                        chartFilter === '7days'
                          ? stats.dailyUserStats.slice(-7)
                          : chartFilter === '30days'
                          ? stats.dailyUserStats
                          : stats.dailyUserStats.slice(-90)
                      }
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#8b5cf6" opacity={0.2} />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fill: '#9ca3af', fontSize: 10 }}
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return date.toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' });
                        }}
                        angle={chartFilter === '90days' ? -45 : 0}
                        textAnchor={chartFilter === '90days' ? 'end' : 'middle'}
                        height={chartFilter === '90days' ? 60 : 30}
                      />
                      <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(17, 24, 39, 0.9)', 
                          border: '1px solid #8b5cf6',
                          borderRadius: '8px',
                          color: '#fff'
                        }}
                        labelFormatter={(value) => new Date(value).toLocaleDateString('fa-IR')}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#8b5cf6" 
                        strokeWidth={2}
                        dot={{ fill: '#8b5cf6', r: chartFilter === '7days' ? 5 : 3 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  )}
                </ResponsiveContainer>
                {/* نمایش تعداد کاربران در بازه انتخاب شده */}
                <div className="mt-4 text-center">
                  <span className="text-sm text-text-secondary">
                    تعداد کاربران در{' '}
                    {chartFilter === '7days'
                      ? '۷ روز گذشته'
                      : chartFilter === '30days'
                      ? '۳۰ روز گذشته'
                      : chartFilter === '90days'
                      ? '۹۰ روز گذشته'
                      : '۱۲ ماه گذشته'}
                    :{' '}
                  </span>
                  <span className="text-lg font-bold text-accent">
                    {chartFilter === '7days'
                      ? stats.usersLast7Days
                      : chartFilter === '30days'
                      ? stats.usersLast30Days
                      : chartFilter === '90days'
                      ? stats.usersLast90Days
                      : stats.monthlyUserStats.reduce((sum, month) => sum + month.count, 0)}
                  </span>
                </div>
              </motion.div>

              {/* نمودار توزیع کاربران بر اساس نقش */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-bg-secondary/80 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 border border-accent/20"
              >
                <h3 className="text-lg md:text-xl font-bold glow-text mb-4">توزیع کاربران بر اساس نقش</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={stats.usersByRole}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ role, count, percent }) => `${role === 'admin' ? 'مدیر' : 'کاربر'}: ${count} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {stats.usersByRole.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(17, 24, 39, 0.9)', 
                        border: '1px solid #8b5cf6',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                      formatter={(value: number, name: string) => [value, name === 'admin' ? 'مدیر' : 'کاربر']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>

              {/* نمودار توزیع بازی‌ها بر اساس دسته‌بندی */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-bg-secondary/80 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 border border-accent/20"
              >
                <h3 className="text-lg md:text-xl font-bold glow-text mb-4">توزیع بازی‌ها بر اساس دسته‌بندی</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={stats.gamesByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, count, percent }) => `${category}: ${count} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {stats.gamesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(17, 24, 39, 0.9)', 
                        border: '1px solid #8b5cf6',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            {/* لیست محبوب‌ترین بازی‌ها */}
            {stats.popularGames && stats.popularGames.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="mb-6 md:mb-8 bg-bg-secondary/80 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 border border-accent/20"
              >
                <h3 className="text-lg md:text-xl font-bold glow-text mb-4">
                  🏆 محبوب‌ترین بازی‌ها (بر اساس Favorites)
                </h3>
                <div className="space-y-3">
                  {stats.popularGames.map((game, index) => (
                    <motion.div
                      key={game.gameId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 + index * 0.05 }}
                      className="flex items-center justify-between p-3 bg-bg-tertiary/50 rounded-lg hover:bg-bg-tertiary transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center text-accent font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-text-primary">{game.gameName}</div>
                          <div className="text-sm text-text-secondary">{game.gameNameEn}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-accent font-bold">❤️ {game.favoritesCount}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* لینک‌های مدیریت */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
              >
                <Link href="/admin/dashboard/users">
                  <div className="bg-bg-secondary/80 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 border border-accent/20 hover:border-accent/50 transition-all duration-200 cursor-pointer group">
                    <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-accent/20 rounded-lg flex items-center justify-center group-hover:bg-accent/30 transition-all duration-200 flex-shrink-0">
                        <svg
                          className="w-5 h-5 md:w-6 md:h-6 text-accent"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                          />
                        </svg>
                      </div>
                      <h2 className="text-xl md:text-2xl font-bold glow-text">مدیریت کاربران</h2>
                    </div>
                    <p className="text-sm md:text-base text-text-secondary">
                      مشاهده لیست کاربران و تغییر دسترسی‌ها
                    </p>
                  </div>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0 }}
              >
                <Link href="/admin/dashboard/games">
                  <div className="bg-bg-secondary/80 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 border border-accent/20 hover:border-accent/50 transition-all duration-200 cursor-pointer group">
                    <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-accent/20 rounded-lg flex items-center justify-center group-hover:bg-accent/30 transition-all duration-200 flex-shrink-0">
                        <svg
                          className="w-5 h-5 md:w-6 md:h-6 text-accent"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <h2 className="text-xl md:text-2xl font-bold glow-text">مدیریت بازی‌ها</h2>
                    </div>
                    <p className="text-sm md:text-base text-text-secondary">
                      مشاهده و ویرایش لیست بازی‌ها
                    </p>
                  </div>
                </Link>
              </motion.div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}


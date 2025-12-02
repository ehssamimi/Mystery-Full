import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper function برای چک کردن نقش ادمین
async function checkAdmin(request: NextRequest) {
  const token = request.cookies.get('session_token')?.value;

  if (!token) {
    return { isAdmin: false, error: 'احراز هویت نشده‌اید' };
  }

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    return { isAdmin: false, error: 'Session منقضی شده است' };
  }

  if (session.user.role !== 'admin') {
    return { isAdmin: false, error: 'دسترسی محدود' };
  }

  return { isAdmin: true };
}

// GET: دریافت آمار Dashboard
export async function GET(request: NextRequest) {
  try {
    const adminCheck = await checkAdmin(request);

    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { success: false, error: adminCheck.error },
        { status: 403 }
      );
    }

    // تعداد کل بازی‌ها
    const totalGames = await prisma.game.count();

    // تعداد کل کاربران
    const totalUsers = await prisma.user.count();

    // تعداد کاربران در بازه‌های زمانی مختلف (یک کوئری برای همه)
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last90Days = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    // استفاده از Promise.all برای اجرای موازی
    const [usersLast7Days, usersLast30Days, usersLast90Days] = await Promise.all([
      prisma.user.count({
        where: {
          createdAt: { gte: last7Days },
        },
      }),
      prisma.user.count({
        where: {
          createdAt: { gte: last30Days },
        },
      }),
      prisma.user.count({
        where: {
          createdAt: { gte: last90Days },
        },
      }),
    ]);

    // آمار کاربران در ۱۲ ماه گذشته (روزانه) - استفاده از raw query برای بهینه‌سازی
    const dailyUserStatsRaw = await prisma.$queryRaw<Array<{ date: string; count: bigint }>>`
      SELECT 
        DATE("createdAt") as date,
        COUNT(*)::int as count
      FROM "User"
      WHERE "createdAt" >= NOW() - INTERVAL '365 days'
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `;

    // تبدیل به فرمت مورد نیاز و پر کردن روزهای خالی (۳۶۵ روز گذشته)
    // نرمال‌سازی کلید تاریخ تا با فرمت YYYY-MM-DD که در حلقه استفاده می‌شود یکسان باشد
    // (ممکن است مقدار برگشتی از Postgres شامل زمان یا timezone باشد)
    const dailyUserStatsMap = new Map(
      dailyUserStatsRaw.map((item) => {
        const dateKey = new Date(item.date).toISOString().split('T')[0];
        return [dateKey, Number(item.count)];
      })
    );
    const dailyUserStats = [];
    for (let i = 364; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      dailyUserStats.push({
        date: dateStr,
        count: dailyUserStatsMap.get(dateStr) || 0,
      });
    }

    // آمار کاربران در 12 ماه گذشته (ماهانه) - استفاده از raw query
    const monthlyUserStatsRaw = await prisma.$queryRaw<Array<{ year: number; month: number; count: bigint }>>`
      SELECT 
        EXTRACT(YEAR FROM "createdAt")::int as year,
        EXTRACT(MONTH FROM "createdAt")::int as month,
        COUNT(*)::int as count
      FROM "User"
      WHERE "createdAt" >= NOW() - INTERVAL '12 months'
      GROUP BY EXTRACT(YEAR FROM "createdAt"), EXTRACT(MONTH FROM "createdAt")
      ORDER BY year ASC, month ASC
    `;

    // تبدیل به فرمت مورد نیاز
    const monthlyUserStatsMap = new Map(
      monthlyUserStatsRaw.map((item) => [`${item.year}-${item.month}`, Number(item.count)])
    );
    const monthlyUserStats = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      monthlyUserStats.push({
        month: date.toLocaleDateString('fa-IR', { year: 'numeric', month: 'long' }),
        monthShort: date.toLocaleDateString('fa-IR', { year: 'numeric', month: 'short' }),
        count: monthlyUserStatsMap.get(key) || 0,
      });
    }

    // توزیع کاربران بر اساس نقش
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        role: true,
      },
    });

    // بازی‌ها بر اساس دسته‌بندی
    const gamesByCategory = await prisma.game.groupBy({
      by: ['category'],
      _count: {
        category: true,
      },
    });

    // آمار Favorites
    const totalFavorites = await prisma.favorite.count();
    
    // محبوب‌ترین بازی‌ها (بیشترین favorites) - استفاده از join برای بهینه‌سازی
    const popularGamesRaw = await prisma.$queryRaw<Array<{
      gameId: string;
      gameName: string;
      gameNameEn: string;
      favoritesCount: bigint;
    }>>`
      SELECT 
        g.id as "gameId",
        g.name as "gameName",
        g."nameEn" as "gameNameEn",
        COUNT(f.id)::int as "favoritesCount"
      FROM "Favorite" f
      INNER JOIN "Game" g ON f."gameId" = g.id
      GROUP BY g.id, g.name, g."nameEn"
      ORDER BY "favoritesCount" DESC
      LIMIT 10
    `;

    const popularGamesWithDetails = popularGamesRaw.map((item) => ({
      gameId: item.gameId,
      gameName: item.gameName,
      gameNameEn: item.gameNameEn,
      favoritesCount: Number(item.favoritesCount),
    }));

    // توزیع favorites بر اساس دسته‌بندی - استفاده از raw query
    const favoritesByCategoryRaw = await prisma.$queryRaw<Array<{ category: string; count: bigint }>>`
      SELECT 
        g.category,
        COUNT(f.id)::int as count
      FROM "Favorite" f
      INNER JOIN "Game" g ON f."gameId" = g.id
      GROUP BY g.category
      ORDER BY count DESC
    `;

    const favoritesByCategoryArray = favoritesByCategoryRaw.map((item) => ({
      category: item.category,
      count: Number(item.count),
    }));

    return NextResponse.json({
      success: true,
      stats: {
        totalGames,
        totalUsers,
        totalFavorites,
        usersLast7Days,
        usersLast30Days,
        usersLast90Days,
        dailyUserStats,
        monthlyUserStats,
        usersByRole: usersByRole.map((item) => ({
          role: item.role,
          count: item._count.role,
        })),
        gamesByCategory: gamesByCategory.map((item) => ({
          category: item.category,
          count: item._count.category,
        })),
        popularGames: popularGamesWithDetails,
        favoritesByCategory: favoritesByCategoryArray,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در دریافت آمار' },
      { status: 500 }
    );
  }
}


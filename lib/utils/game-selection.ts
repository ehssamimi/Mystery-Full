import { Game } from '@/types/game';

/**
 * انتخاب رندم بازی بر اساس وزن (score)
 * بازی‌های با score بالاتر احتمال بیشتری برای انتخاب دارند
 */
export function selectRandomGameByWeight(games: Game[]): Game | null {
  if (games.length === 0) return null;
  
  // فیلتر کردن فقط بازی‌های active (اگر در API فیلتر نشده باشد)
  const activeGames = games.filter(game => game.isActive !== false);
  if (activeGames.length === 0) return null;
  
  // محاسبه مجموع وزن‌ها (استفاده از score به عنوان وزن)
  const totalWeight = activeGames.reduce((sum, game) => {
    const weight = game.score || 5; // پیش‌فرض 5
    return sum + weight;
  }, 0);
  
  // انتخاب رندم با weighted selection
  let random = Math.random() * totalWeight;
  for (const game of activeGames) {
    const weight = game.score || 5;
    random -= weight;
    if (random <= 0) return game;
  }
  
  return activeGames[0]; // fallback
}


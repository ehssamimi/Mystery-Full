/**
 * Mapping هاردکد شده بین game IDs و game-type IDs
 * این فایل برای ارتباط بازی‌ها با game-types استفاده می‌شود
 * تا در صفحه play بتوانیم تشخیص دهیم چه نوع بازی را نمایش دهیم
 */

export const gameTypeMapping: Record<string, string> = {
  // مثال:
  // 'game-id-1': 'game-type-id-1',
  // 'game-id-2': 'game-type-id-2',
  // TODO: این mapping را با game IDs و game-type IDs واقعی پر کنید
};

/**
 * دریافت game-type ID برای یک game ID
 * @param gameId - شناسه بازی
 * @returns game-type ID یا null اگر mapping وجود نداشته باشد
 */
export function getGameTypeId(gameId: string): string | null {
  return gameTypeMapping[gameId] || null;
}

/**
 * بررسی اینکه آیا یک game ID در mapping وجود دارد
 * @param gameId - شناسه بازی
 * @returns true اگر mapping وجود داشته باشد
 */
export function hasGameTypeMapping(gameId: string): boolean {
  return gameId in gameTypeMapping;
}


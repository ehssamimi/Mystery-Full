// localStorage helpers for favorites and history

export const StorageKeys = {
  FAVORITES: 'mystery-full-favorites',
  HISTORY: 'mystery-full-history',
  PLAYER_COUNT: 'mystery-full-player-count',
} as const;

export function getFavorites(): string[] {
  if (typeof window === 'undefined') return [];
  const favorites = localStorage.getItem(StorageKeys.FAVORITES);
  return favorites ? JSON.parse(favorites) : [];
}

export function addToFavorites(gameId: string): void {
  if (typeof window === 'undefined') return;
  const favorites = getFavorites();
  if (!favorites.includes(gameId)) {
    favorites.push(gameId);
    localStorage.setItem(StorageKeys.FAVORITES, JSON.stringify(favorites));
  }
}

export function removeFromFavorites(gameId: string): void {
  if (typeof window === 'undefined') return;
  const favorites = getFavorites();
  const filtered = favorites.filter((id) => id !== gameId);
  localStorage.setItem(StorageKeys.FAVORITES, JSON.stringify(filtered));
}

export function isFavorite(gameId: string): boolean {
  return getFavorites().includes(gameId);
}

export interface HistoryItem {
  gameId: string;
  playedAt: string;
  playerCount: number;
}

export function getHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return [];
  const history = localStorage.getItem(StorageKeys.HISTORY);
  return history ? JSON.parse(history) : [];
}

export function addToHistory(gameId: string, playerCount: number): void {
  if (typeof window === 'undefined') return;
  const history = getHistory();
  history.unshift({
    gameId,
    playedAt: new Date().toISOString(),
    playerCount,
  });
  // Keep only last 50 items
  const limited = history.slice(0, 50);
  localStorage.setItem(StorageKeys.HISTORY, JSON.stringify(limited));
}

export function getPlayerCount(): number | null {
  if (typeof window === 'undefined') return null;
  const count = localStorage.getItem(StorageKeys.PLAYER_COUNT);
  return count ? parseInt(count, 10) : null;
}

export function setPlayerCount(count: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(StorageKeys.PLAYER_COUNT, count.toString());
}


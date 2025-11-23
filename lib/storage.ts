// localStorage helpers for favorites and history

export const StorageKeys = {
  FAVORITES: 'mystery-full-favorites',
  HISTORY: 'mystery-full-history',
  PLAYER_COUNT: 'mystery-full-player-count',
} as const;

// استفاده از API برای favorites (ذخیره در دیتابیس)
export async function getFavorites(): Promise<string[]> {
  if (typeof window === 'undefined') return [];
  
  try {
    const response = await fetch('/api/favorites');
    const data = await response.json();
    
    if (data.success) {
      return data.favorites.map((f: { gameId: string }) => f.gameId);
    }
  } catch (error) {
    console.error('Error fetching favorites from API:', error);
    // Fallback to localStorage
    const favorites = localStorage.getItem(StorageKeys.FAVORITES);
    return favorites ? JSON.parse(favorites) : [];
  }
  
  return [];
}

export async function addToFavorites(gameId: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  
  try {
    const response = await fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId }),
    });
    
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error adding favorite:', error);
    // Fallback to localStorage
    const favorites = getFavoritesSync();
    if (!favorites.includes(gameId)) {
      favorites.push(gameId);
      localStorage.setItem(StorageKeys.FAVORITES, JSON.stringify(favorites));
    }
    return false;
  }
}

export async function removeFromFavorites(gameId: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  
  try {
    const response = await fetch(`/api/favorites?gameId=${gameId}`, {
      method: 'DELETE',
    });
    
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error removing favorite:', error);
    // Fallback to localStorage
    const favorites = getFavoritesSync();
    const filtered = favorites.filter((id) => id !== gameId);
    localStorage.setItem(StorageKeys.FAVORITES, JSON.stringify(filtered));
    return false;
  }
}

export async function isFavorite(gameId: string): Promise<boolean> {
  const favorites = await getFavorites();
  return favorites.includes(gameId);
}

// Helper functions for backward compatibility (localStorage)
function getFavoritesSync(): string[] {
  if (typeof window === 'undefined') return [];
  const favorites = localStorage.getItem(StorageKeys.FAVORITES);
  return favorites ? JSON.parse(favorites) : [];
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


export interface Game {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  minPlayers: number;
  maxPlayers: number;
  category: string;
  rules: string;
  tips?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number;
  materials?: string; // مواد مورد نیاز
  isActive?: boolean; // فعال/غیرفعال بودن بازی
}


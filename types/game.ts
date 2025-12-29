export interface GameType {
  id: string;
  nameFa: string;
  nameEn: string;
}

export interface DatasetItem {
  id: string;
  nameFa: string;
  nameEn: string;
}

export interface Dataset {
  id: string;
  nameFa: string;
  nameEn: string;
  items: DatasetItem[];
}

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
  imageUrl?: string; // URL تصویر از Cloudinary
  isActive?: boolean; // فعال/غیرفعال بودن بازی
  score?: number; // امتیاز بازی (برای weighted random selection)
  // نوع بازی (playtype)
  playtype?: GameType | null;
  gameType?: GameType | null; // برای سازگاری با کدهای قدیمی
  // فقط ID های datasets (نه اطلاعات کامل)
  datasetIds?: string[];
}


export type CameraStatus = 'draft' | 'published' | 'deleted';

export interface CameraModel {
  id: number;
  model_name: string;
  description: string;
  power: number; // Мощность в Вт
  resolution: string; // Например, 'Full HD', '2K QHD', 'Super HD'
  is_outdoor: boolean; // Уличная или для помещения
  status: CameraStatus;
  image_url: string; // Путь через MinIO proxy (/media/...) или локальный fallback
  video_url: string; // Путь через MinIO proxy (/media/...) или локальный fallback
  likes_count: number; // Количество лайков
  housing_type?: string; // Купольный / Цилиндрический / Корпусный
  creator_id?: number;
  is_creator?: number; // 1 если текущий авторизованный пользователь — создатель
  is_liked?: number; // 1 если текущий авторизованный пользователь поставил лайк
}

export interface FilterState {
  powerMax: number;
}

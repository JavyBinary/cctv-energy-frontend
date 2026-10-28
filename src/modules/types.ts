export type CameraStatus = 'draft' | 'published' | 'deleted';

export interface CameraModel {
  id: number;
  model_name: string;
  description: string;
  power: number; // Мощность в Вт
  resolution: string; // Например, 'Full HD', '2K QHD', 'Super HD'
  is_outdoor: boolean; // Уличная или для помещения
  status: CameraStatus;
  image_url: string; // Относительный путь к изображению или пустая строка для fallback
  video_url: string; // Относительный путь к видео или пустая строка для fallback
  likes_count: number; // Количество лайков
  housing_type?: string; // Купольный / Цилиндрический / Корпусный
}

export interface FilterState {
  powerMax: number;
}

import { dest_api, dest_img } from './target_config';

export interface CameraItem {
  id: number;
  model_name: string;
  description: string | null;
  description_en?: string;
  status: string;
  image_url: string | null;
  video_url: string | null;
  power: number | null;
  resolution: string | null;
  likes_count: number;
}

interface PaginatedCamerasResponse {
  total: number;
  page: number;
  limit: number;
  data: CameraItem[];
}

export const mediaUrl = (url: string | null): string => {
  if (!url) return `${dest_api}/DefaultImage.jpg`;
  if (url.startsWith('/media/')) return `${dest_img}${url}`;
  if (url.startsWith('/')) return `${dest_api}${url}`;
  try {
    const { pathname } = new URL(url);
    return `${dest_img}${pathname}`;
  } catch {
    return `${dest_api}/DefaultImage.jpg`;
  }
};

// Фильтрация по максимальной мощности выполняется на бэкенде
export const getCameras = async (powerMax: number): Promise<CameraItem[]> => {
  const query = new URLSearchParams({
    power_max: String(powerMax),
    page: '1',
    limit: '100',
  });
  const response = await fetch(`${dest_api}/api/cameras?${query}`);
  if (!response.ok) {
    throw new Error('Не удалось загрузить список камер с сервера.');
  }
  const payload: PaginatedCamerasResponse = await response.json();
  return payload.data;
};

// Получение подробной информации о камере (публичный метод ленты по id без авторизации)
export const getCamera = async (id: number): Promise<CameraItem> => {
  const query = new URLSearchParams({ camera_id: String(id) });
  const response = await fetch(`${dest_api}/api/cameras/feed?${query}`);
  if (response.status === 404) {
    throw new Error('Камера не найдена.');
  }
  if (!response.ok) {
    throw new Error('Не удалось загрузить данные камеры.');
  }
  return response.json();
};

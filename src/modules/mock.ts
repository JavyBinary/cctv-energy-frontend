import { CameraModel } from './types';

export const DEFAULT_IMAGE = '/DefaultImage.jpg';
export const DEFAULT_VIDEO = '/DefaultVideo.mp4';

export const CAMERAS_MOCK: CameraModel[] = [
  {
    id: 1,
    model_name: 'DS-2CE16D8T-ITE',
    description: '2Мп уличная компактная цилиндрическая HD-TVI камера с EXIR-подсветкой до 20м 1/3 Progressive Scan CMOS; объектив 3.6мм; угол обзора: 82.6°; механический ИК-фильтр; 0.005 Лк@F1.2; 1920×1080@25к/с; WDR 120дБ, 3D DNR, BLC; OSD-меню; Smart ИК; 1 HD-TVI выход; IP67; -40°С до +60°С; питание 12В DC±25% / PoC.af; 3.6Вт макс.',
    power: 3.6,
    resolution: 'Full HD',
    is_outdoor: true,
    status: 'published',
    image_url: '/camera_1.jpg',
    video_url: '/video_1.mp4',
    likes_count: 5,
    housing_type: 'Цилиндрический',
  },
  {
    id: 2,
    model_name: 'DS-2CD2123G0-IS',
    description: '2Мп купольная IP-камера с ИК-подсветкой до 30м 1/2.8 Progressive Scan CMOS; объектив 2.8мм; угол обзора 114°; механический ИК-фильтр; 0.01 Лк@F1.2; сжатие H.265/H.264/MJPEG; тройной поток; 1920×1080@25к/с; WDR 120дБ, 3D DNR, BLC, ROI; обнаружение движения, вторжения в область и пересечения линии; слот для microSD до 128Гб; аудиовход/выход 1/1; тревожные вход/выход 1/1; 1 RJ45 10M/100M Ethernet; питание DC12В±25%/PoE(802.3af); 6Вт макс.',
    power: 6.0,
    resolution: 'Full HD',
    is_outdoor: false,
    status: 'published',
    image_url: '/camera_2.jpg',
    video_url: '/video_2.mp4',
    likes_count: 2,
    housing_type: 'Купольный',
  },
  {
    id: 3,
    model_name: 'DS-2CD50C5G0-AP',
    description: '12Мп стандартная корпусная IP-камера 1/1.7 Progressive Scan CMOS; крепление объектива C/CS; механический ИК-фильтр; 0.005 Лк@F1.2; сжатие H.265/H.264/MJPEG; пять потоков; 4000×3000@20к/с, 3840×2160@25к/с; DWDR, 3D DNR, BLC, антитуман, HLC, ROI; smart видеоаналитика; слот для microSD до 256Гб; аудиовход/выход 1/1; тревожные вход/выход 2/2; 1Vp-p композитный выход (75 Ом/BNC); 1 RJ45 10M/100M/1000M Ethernet; RS-485; питание DC12В/AC24В/PoE(802.3af); 7Вт макс.',
    power: 7.0,
    resolution: '2K QHD',
    is_outdoor: false,
    status: 'published',
    image_url: '/camera_3.jpg',
    video_url: '/video_3.mp4',
    likes_count: 3,
    housing_type: 'Корпусный',
  },
  {
    id: 4,
    model_name: 'DS-2CD2025FWD-I',
    description: '2Мп уличная цилиндрическая IP-камера с EXIR-подсветкой до 30м 1/2.8 Progressive Scan CMOS; объектив 4мм; угол обзора 86°; механический ИК-фильтр; 0.005 Лк@F1.2; сжатие H.265/H.264/MJPEG; тройной поток; 1920×1080@25к/с; WDR 120дБ, 3D DNR, BLC, ROI; smart видеоаналитика; слот для microSD до 128Гб; 1 RJ45 10M/100M Ethernet; IP67; -40°C до +60°C; питание DC12В±25%/PoE(802.3af); 6.5Вт макс.',
    power: 6.5,
    resolution: 'Super HD',
    is_outdoor: true,
    status: 'published',
    image_url: '/camera_4.jpg',
    video_url: '/video_4.mp4',
    likes_count: 1,
    housing_type: 'Цилиндрический',
  },
  {
    id: 5,
    model_name: 'DS-2CE56H0T-ITME (Черновик)',
    description: '5Мп уличная купольная HD-TVI камера с EXIR-подсветкой до 20м и технологией PoC. Тестовый черновик с демонстрацией дефолтных изображений и видео при пустых медиа-полях.',
    power: 4.2,
    resolution: 'Full HD',
    is_outdoor: true,
    status: 'draft',
    image_url: '', // пустая строка для проверки fallback на DefaultImage.jpg
    video_url: '', // пустая строка для проверки fallback на DefaultVideo.mp4
    likes_count: 0,
    housing_type: 'Купольный',
  },
];

export function getPublishedCameras(powerMax?: number): CameraModel[] {
  let list = CAMERAS_MOCK.filter((c) => c.status === 'published');
  if (powerMax !== undefined && !isNaN(powerMax) && powerMax > 0) {
    list = list.filter((c) => c.power <= powerMax);
  }
  return list;
}

export function getCameraById(id: number): CameraModel | undefined {
  return CAMERAS_MOCK.find((c) => c.id === id);
}

export function getNextCameraId(currentId: number): number {
  const published = CAMERAS_MOCK.filter((c) => c.status === 'published');
  if (published.length === 0) return currentId;
  const currentIndex = published.findIndex((c) => c.id === currentId);
  if (currentIndex === -1 || currentIndex === published.length - 1) {
    return published[0].id;
  }
  return published[currentIndex + 1].id;
}

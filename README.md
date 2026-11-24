# Фронтенд-приложение: Каталог и Лента камер видеонаблюдения (ЛР7)

## 1. Общие сведения
- **Дисциплина**: Проектирование систем и продуктовая веб-разработка (РИП).
- **Модуль**: 2.
- **Лабораторная работа №7**: Адаптивная вёрстка, PWA (Progressive Web App), HTTPS через `mkcert` и деплой на GitHub Pages.
- **Студент**: Чоботов Л.К., группа ИУ5-51Б.
- **Ветка Git**: `frontend-pwa` (продолжение `frontend-react` → `frontend-redux`).
- **GitHub Pages (только моки)**: `https://JavyBinary.github.io/cctv-energy-frontend/` (ветка `gh-pages`).

---

## 2. Реализация требований ЛР7
1. **Адаптивный дизайн (без жёсткого фрейма `390px`)**:
   - **Страница «Плитка» (`CameraCatalogPage.css`)**:
     - `< 360px`: `1` колонка (`1fr`), отступ `10px`;
     - `360px – 575px`: `2` колонки (`repeat(2, minmax(0, 1fr))`), отступ `12px`;
     - `576px – 991px`: `3` колонки (`repeat(3, minmax(0, 1fr))`), отступ `16px`;
     - `>= 992px`: `4` колонки (`repeat(4, minmax(0, 1fr))`), отступ `20px`, максимальная ширина контейнера `1200px`.
   - **Страница «Лента» (`CameraFeedPage.css`)**: полноэкранный вертикальный плеер на мобильных (`calc(100dvh - 70px)`), на экранах `>= 768px` — центрированный вертикальный плеер шириной `max-width: 440px`.
   - **Страница «Добавление» (`CameraCreatePage.css`)** и **«Вход» (`LoginPage.css`)**: адаптивные формы, на `>= 600px` слоты Фото и Видео отображаются в 2 столбца.
   - **Нижняя панель навигации (`BottomNavBar.css`)**: фиксированная панель во всю ширину экрана (`position: fixed`), на десктопе ссылки выравниваются по центру с отступом `48px`.
2. **PWA (`vite-plugin-pwa` + `Workbox`)**:
   - Иконки приложения: `public/logo192.png` (`192×192`) и `public/logo512.png` (`512×512`).
   - Web App Manifest и Service Worker (`registerSW({ immediate: true })` в `src/main.tsx`) с кэшированием статики и медиафайлов (лимит `5 MB`) для офлайн-режима.
3. **HTTPS и работа в локальной сети**:
   - В `vite.config.ts` подключён `vite-plugin-mkcert` (автоматический локально доверенный TLS-сертификат при `npm run dev`) + `host: true`, чтобы открывать приложение на телефоне по `https://<IP_ноутбука>:5173`.
   - Vite Proxy (`/api` → `:8000`, `/media` → `:9000`) позволяет телефону работать с бэкендом ноутбука через единый HTTPS-адрес без CORS.
   - Приватные ключи (`*.key`, `*.crt`, `*.pem`) исключены через `.gitignore`.
4. **GitHub Pages (строго моки)**:
   - Сборка `npm run build:pages` выставляет `VITE_MOCK_ONLY=true`, `VITE_BASE_PATH=/cctv-energy-frontend/` и создаёт `dist/404.html` для корректной маршрутизации `BrowserRouter`.

---

## 3. Команды запуска и деплоя
```bash
npm install
npm run dev           # Локальный HTTP-сервер (быстрый запуск на :5173)
npm run dev:https     # Локальный HTTPS-сервер по IP и localhost (для PWA на телефоне)
npm run build         # Сборка + генерация manifest.webmanifest и sw.js
npm run build:pages   # Сборка для GitHub Pages (только моки)
npm run deploy        # Публикация ветки gh-pages
npm test              # Автотесты ассетов, структуры и PWA-артефактов
```

# CCTV Energy Tauri App — Доп 2 (Нативное приложение с ИИ)

Отдельный репозиторий: **`cctv-energy-tauri`** (ветка `main`).

## Что реализовано
- Нативное приложение на **Tauri 2** для **гостя** (без авторизации, добавления, редактирования и лайков).
- **2 страницы** (`HashRouter`):
  1. `/#/` — Список моделей камер: фильтрация по мощности (`power_max`) на бэкенде + поиск похожих моделей по загруженному изображению через `@huggingface/transformers` (модель `Xenova/siglip-base-patch16-224`, квантизация `q8`, `wasm`, Web Worker).
  2. `/#/cameras/:id` — Подробнее о модели камеры (`model_name`, `power`, `resolution`, `likes_count`, русское `description`, английское `description_en`).
- Подключение к API (`:8000`) и MinIO (`:9000`) по IP локальной сети (`src/target_config.ts`, `src-tauri/tauri.conf.json`, `src-tauri/capabilities/default.json`) через `tauri-plugin-http` и `tauri-plugin-cors-fetch`.

## Настройка LAN IP
Узнайте IP ноутбука:
```bash
ipconfig getifaddr en0
```
При смене сети замените IP в:
1. `src/target_config.ts` (`lan_host`)
2. `src-tauri/tauri.conf.json` (`app.security.csp`)
3. `src-tauri/capabilities/default.json` (`http:default` -> `allow`)

## Установка и сборка
```bash
# Если Rust ещё не установлен на macOS:
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

npm install
npm run build         # проверка TypeScript + Vite сборки
npm run tauri dev     # отладочный режим Tauri
npm run tauri build   # релизная сборка (.app / .dmg в src-tauri/target/release/bundle)
```

## Поиск исходящего порта Tauri (для диаграммы развёртывания)
```bash
sudo tcpdump -i en0 'tcp port 8000' -nn
```
Либо в Wireshark на интерфейсе `en0` с фильтром `tcp.port == 8000` (смотреть `Source Port`).

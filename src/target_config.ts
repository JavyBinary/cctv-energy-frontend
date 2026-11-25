// Адреса бэкенда и MinIO в локальной сети (не localhost).
// В собранном приложении Tauri нет сервера Vite с прокси, поэтому запросы идут напрямую на LAN IP.
// Узнать IP на macOS: ipconfig getifaddr en0
export const lan_host = '172.20.10.8';

export const api_proxy_addr = `http://${lan_host}:8000`;
export const img_proxy_addr = `http://${lan_host}:9000`;

// Признак запуска внутри окна Tauri (а не во вкладке браузера при npm run dev)
export const target_tauri = '__TAURI_INTERNALS__' in window;

// В браузере (npm run dev) запросы идут на текущий origin через прокси Vite (vite.config.ts)
export const dest_api = target_tauri ? api_proxy_addr : '';
export const dest_img = target_tauri ? img_proxy_addr : '';

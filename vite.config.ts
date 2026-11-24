import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mkcert from 'vite-plugin-mkcert';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ command }) => {
  const useHttps = command === 'serve' && process.env.VITE_HTTPS === 'true';
  const basePath = process.env.VITE_BASE_PATH || '/';

  return {
    base: basePath,
    plugins: [
      react(),
      ...(useHttps ? [mkcert()] : []),
      VitePWA({
        registerType: 'autoUpdate',
        devOptions: {
          enabled: true,
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
          globPatterns: ['**/*.{js,css,html,ico,png,jpg,svg,mp4,webmanifest}'],
        },
        manifest: {
          name: 'Расчет энергопотребления видеонаблюдения',
          short_name: 'СВН Камеры',
          description: 'Каталог и лента моделей камер видеонаблюдения (Тема 9)',
          start_url: '.',
          scope: '.',
          display: 'standalone',
          background_color: '#ffffff',
          theme_color: '#D71820',
          orientation: 'portrait-primary',
          icons: [
            {
              src: 'logo192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'logo512.png',
              sizes: '512x512',
              type: 'image/png',
            },
          ],
        },
      }),
    ],
    server: {
      port: 5173,
      host: true,
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
        },
        '/static': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
        },
        '/media': {
          target: 'http://127.0.0.1:9000',
          changeOrigin: true,
        },
      },
    },
  };
});

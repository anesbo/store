// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // This will cache all your app's essential files (HTML, CSS, JS, images)
      // so it can load instantly and work offline.
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      // This is the content for your manifest.json file
      manifest: {
        name: 'Store App',
        short_name: 'StoreApp',
        description: 'An offline-capable store management application.',
        theme_color: '#2c3e50',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
});
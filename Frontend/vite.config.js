import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [react(), tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Gen-Notes',
        short_name: 'GenNotes',
        description: 'OCR-powered secure note app',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#0f172a',
        icons: [
          {
            src: '/favicon/favicon-96x96.png',
            sizes: '96x96',
            type: 'image/png'
          },
          {
            src: '/favicon/apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png'
          },
          {
            src: '/favicon/web-app-manifest-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/favicon/web-app-manifest-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          },
        ]
      },
      includeAssets: ['favicon/*.png', 'favicon/*.ico', 'favicon/*.svg'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ]
})
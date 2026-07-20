import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'inline',
      devOptions: {
        enabled: true,
      },
      // Only precache the app shell (JS/CSS/HTML/icons). Never cache /live, /vod,
      // /authenticate, /profile, /search, or proxied streams — those must always
      // hit the network so live channels, tokens, and playback stay correct.
      manifest: {
        name: 'IPTV',
        short_name: 'IPTV',
        description: 'Live TV, Movies & Series streaming',
        start_url: '/',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#000000',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['embla-carousel-react', 'embla-carousel-autoplay'],
    force: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar vendor chunks para mejor caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'animation-vendor': ['gsap'],
          'map-vendor': ['leaflet', 'leaflet-react'],
          'fullpage-vendor': ['fullpage.js'],
          'icons-vendor': ['react-icons']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  server: {
    fs: {
      strict: false
    }
  },
  clearScreen: false
})

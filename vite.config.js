import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['embla-carousel-react', 'embla-carousel-autoplay'],
    force: true
  },
  server: {
    fs: {
      strict: false
    }
  },
  clearScreen: false
})

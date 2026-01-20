import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'https://ipauseads.com/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/auth': {
        target: 'https://ipauseads.com/api',
        changeOrigin: true
      },
      '/analytics': {
        target: 'https://ipauseads.com/api',
        changeOrigin: true
      },
      '/qr': {
        target: 'https://ipauseads.com/api',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser'
  }
})

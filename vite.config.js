import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/claude': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/api/gemini': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/api/google-ads': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/api/ga4': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/api/linkedin': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/api/meta': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})

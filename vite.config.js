// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // フロントからは /api/save-record を叩く → Viteが n8n へ中継
      '/api/save-record': {
        target: 'https://n8n.srv1038507.hstgr.cloud',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/save-record/, '/webhook/save-diet-record'),
      },
    },
  },
})

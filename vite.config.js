// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
  proxy: {
    '/api/save-record': {
      target: 'https://n8n.srv1038507.hstgr.cloud',
      changeOrigin: true,
      secure: true,      // 自己署名なら false
      rewrite: p => p.replace(/^\/api\/save-record/, '/webhook/save-diet-record'),
    },
  },
},
})

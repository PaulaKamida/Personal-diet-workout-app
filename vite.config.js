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
        secure: true, // 自己署名なら false
        // n8nを有効化しているなら /webhook/ の方！
        rewrite: (p) => p.replace(/^\/api\/save-record/, '/webhook/save-diet-record'),
        // まだ未有効でテストURLなら ↓ に変える
        // rewrite: (p) => p.replace(/^\/api\/save-record/, '/webhook-test/save-diet-record'),
      },
    },
  },
})

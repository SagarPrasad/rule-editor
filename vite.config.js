import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Use base path only for production builds (GitHub Pages)
// For local dev, use empty base path
const base = process.env.NODE_ENV === 'production' ? '/rule-editor/' : '/'

export default defineConfig({
  plugins: [react()],
  base: base,
  server: {
    port: 3000,
    open: true,
    allowedHosts: [
      '317ab385fab2.ngrok-free.app'
    ]
  }
})

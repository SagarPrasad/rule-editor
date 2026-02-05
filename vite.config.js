import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig(({ command, mode }) => {
  // Use base path only for production builds (GitHub Pages)
  // For local dev (serve command), use root path
  const base = command === 'build' ? '/rule-editor/' : '/'
  
  return {
    plugins: [react()],
    base: base,
    server: {
      port: 3000,
      open: true,
      allowedHosts: [
        '317ab385fab2.ngrok-free.app'
      ]
    }
  }
})

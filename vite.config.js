import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  base: '/rule-editor/',
  server: {
    port: 3000,
    open: true,
    allowedHosts: [
      '317ab385fab2.ngrok-free.app'
    ]
  }
})

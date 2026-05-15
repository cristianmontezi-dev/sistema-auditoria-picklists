ipconfig
IPv4 Address. . . . . . . . . . . : 192.168.1.100
inet 192.168.1.100
Ctrl + C
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',  // Permite acesso externo
  },
})

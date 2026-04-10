import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/julebu/',
  server: {
    host: '0.0.0.0', // 强制监听所有网卡
    port: 5173,      // 固定端口
    strictPort: true // 如果端口被占用则报错，不自动跳端口
  }
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

const repoBase = '/Arch20-Portfolio-WebApp/'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? repoBase : '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'lucide-react': path.resolve(__dirname, './src/shims/lucide-react.tsx'),
    },
  },
}))

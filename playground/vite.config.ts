import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  root: __dirname,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      'wcontour-js': path.resolve(__dirname, '../src'),
    },
  },
  server: {
    port: 5174,
    open: true,
  },
})

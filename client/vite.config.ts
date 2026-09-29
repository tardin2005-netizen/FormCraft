import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  // Pre-bundle the PDF reader at dev-server start; discovering it on first use made Vite re-optimize
  // and break the lazy import ("Failed to fetch dynamically imported module").
  optimizeDeps: { include: ['pdfjs-dist'] },
})

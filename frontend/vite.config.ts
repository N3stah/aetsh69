import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:8000'
    }
  },
  build: {
    // 1. Disable sourcemaps in production to prevent source code exposure
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      }
    }
  },
  esbuild: {
    // 2. Drop console.log and debugger statements in production builds
    drop: ['console', 'debugger']
  }
})

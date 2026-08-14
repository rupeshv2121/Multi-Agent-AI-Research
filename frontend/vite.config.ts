import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// The Python backend (server.py) runs on 127.0.0.1:8000. Proxying /api keeps the
// browser on a single origin in dev, so SSE and cookies behave the same as they
// will in production where FastAPI serves the built bundle itself.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        // Buffering would defeat the point of the SSE endpoint.
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            if (proxyRes.headers['content-type']?.includes('text/event-stream')) {
              proxyRes.headers['cache-control'] = 'no-cache'
            }
          })
        },
      },
    },
  },
  build: {
    outDir: 'dist',
    // Route-level lazy imports (see App.tsx) already split the heavy
    // dependencies — Recharts, React Flow and the markdown stack each land in
    // their own chunk, so no manual chunking is needed.
    chunkSizeWarningLimit: 900,
  },
})

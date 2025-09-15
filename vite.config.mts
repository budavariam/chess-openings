import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/chess-openings/',  // Keep the trailing slash
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    // For local development with the base path
    open: '/chess-openings/'
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Ensure proper asset handling
    rollupOptions: {
      output: {
        // Consistent asset naming
        assetFileNames: 'assets/[name].[hash].[ext]',
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js'
      }
    }
  }
})

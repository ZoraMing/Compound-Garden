import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Ensures assets are linked correctly on GitHub Pages (e.g. user.github.io/repo-name/)
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1000, // Increase limit since Phaser is large
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor libraries into separate chunks
          phaser: ['phaser'],
          react: ['react', 'react-dom'],
          // Split components
          components: ['./components/Controls.tsx', './components/PhaserGame.tsx'],
        }
      }
    }
  },
});
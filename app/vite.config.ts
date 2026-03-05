import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// VITE_BASE_URL set in CI for preview (e.g. /preview/ftr-added-entry/); default / for production
const base = process.env.VITE_BASE_URL ?? '/';

export default defineConfig({
  plugins: [react()],
  base,
  build: {
    outDir: '../dist',
    emptyOutDir: false,
    rollupOptions: {
      input: 'index.html',
    },
  },
});

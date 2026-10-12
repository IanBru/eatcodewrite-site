import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// VITE_BASE_URL set in CI for preview (e.g. /preview/ftr-added-entry/); default / for production
const base = process.env.VITE_BASE_URL ?? '/';

// `vite preview` resolves /blog/<slug> to dist/blog/<slug>.html (the unstyled static page).
// CloudFront serves the SPA for those URLs, so do the same locally.
const spaRoutesInPreview: Plugin = {
  name: 'spa-routes-in-preview',
  configurePreviewServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (req.url && /^\/(blog|recipes)\/[^./?]+\/?(\?.*)?$/.test(req.url)) req.url = '/index.html';
      next();
    });
  },
};

export default defineConfig({
  plugins: [react(), spaRoutesInPreview],
  base,
  build: {
    outDir: '../dist',
    emptyOutDir: false,
    rollupOptions: {
      input: 'index.html',
    },
  },
});

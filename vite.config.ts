import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const getBase = () => {
  if (process.env.VITE_BASE_PATH) {
    return process.env.VITE_BASE_PATH;
  }
  if (process.env.GITHUB_PAGES === 'true') {
    if (process.env.GITHUB_REPOSITORY) {
      const repoName = process.env.GITHUB_REPOSITORY.split('/')[1];
      return `/${repoName}/`;
    }
    return '/digital-twin/';
  }
  return '/';
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: getBase(),
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
});

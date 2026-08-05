// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

// https://astro.build/config
export default defineConfig({
  // 前端保持静态站（双平台架构：Cloudflare Pages 静态资源 + 现有 _worker.js 代理到 Vercel Hono）。
  output: 'static',
  i18n: {
    locales: ['en', 'zh'],
    defaultLocale: 'en',
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      rollupOptions: {
        output: {
          // 保持独立 vendor chunk，便于浏览器缓存（与迁移前约定一致）。
          manualChunks(id) {
            if (!id.includes('node_modules')) return;
            if (id.includes('recharts') || id.includes('d3-') || id.includes('victory')) return 'vendor-recharts';
            if (id.includes('motion')) return 'vendor-motion';
            if (id.includes('lucide-react')) return 'vendor-lucide';
            if (id.includes('/react') || id.includes('react-dom') || id.includes('scheduler')) return 'vendor-react';
          },
        },
      },
    },
    server: {
      // 本地前端把同源 /api 代理到本地 Hono（npm run dev:api 默认 8787）。
      proxy: {
        '/api': {
          target: process.env.API_DEV_SERVER || 'http://localhost:8787',
          changeOrigin: true,
        },
      },
    },
  },
});

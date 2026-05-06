import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// GitHub Pages: served at https://vectorize-io.github.io/self-driving-agents/
const SITE = process.env.SITE_URL ?? 'https://vectorize-io.github.io';
const BASE = process.env.SITE_BASE ?? '/self-driving-agents';

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'ignore',
  vite: {
    plugins: [tailwindcss()],
  },
});

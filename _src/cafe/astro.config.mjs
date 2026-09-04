import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://keita-works.com',
  base: '/works/cafe',
  trailingSlash: 'always',
  build: { format: 'directory' },
});

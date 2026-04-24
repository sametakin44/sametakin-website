// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// Custom domain sonradan bağlanınca bu değeri gerçek URL ile değiştir.
export default defineConfig({
  site: 'https://sametakin-portfolio.pages.dev',
  integrations: [react(), mdx(), sitemap()],

  vite: {
    plugins: [tailwindcss()],
  },
});

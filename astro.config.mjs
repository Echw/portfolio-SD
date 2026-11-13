import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  i18n: {
    locales: ['en', 'pl'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: false },
  },
  devToolbar: { enabled: false },
});

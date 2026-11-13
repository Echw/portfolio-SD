import { getRelativeLocaleUrl } from 'astro:i18n';
import type { Locale } from './ui';

/** Shared slugs and anchors keep equivalent pages addressable in both languages. */
export function localizedPath(locale: Locale, path = '/') {
  return getRelativeLocaleUrl(locale, path.replace(/^\/pl(?=\/|$)/, '').replace(/^\//, ''));
}

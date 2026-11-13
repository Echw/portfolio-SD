import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

const root = fileURLToPath(new URL('../', import.meta.url));
const cache = new Map();
function load(file) {
  const absolute = resolve(root, file);
  if (cache.has(absolute)) return cache.get(absolute);
  const exports = {};
  cache.set(absolute, exports);
  const source = ts.transpileModule(readFileSync(absolute, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  runInNewContext(source, { exports, require(specifier) {
    if (/\.(webp|jpg|png)$/.test(specifier)) return { default: { src: specifier, width: 1920, height: 1080 } };
    return load(resolve(dirname(absolute), specifier + '.ts'));
  } });
  return exports;
}
const plain = (value) => JSON.parse(JSON.stringify(value));
const readPage = (path) => readFileSync(resolve(root, 'dist', path, 'index.html'), 'utf8');
const en = load('src/data/portfolio.ts'), pl = load('src/data/pl/portfolio.ts');
const enExperience = load('src/data/experience.ts').experience;
const plExperience = load('src/data/pl/experience.ts').experience;
const enStudies = load('src/data/case-studies.ts'), plStudies = load('src/data/pl/case-studies.ts');
const routes = ['', ...en.projects.map((project) => project.caseStudyHref.slice(1)), ...enExperience.map((entry) => `experience/${entry.id}/`)];

test('Polish copy preserves identities and covers every source content field', () => {
  assert.deepEqual(plain(pl.projects.map(({ id, name, url, image }) => ({ id, name, url, image }))), plain(en.projects.map(({ id, name, url, image }) => ({ id, name, url, image }))));
  assert.deepEqual(plain(plExperience.map(({ id, company, role, technologies }) => ({ id, company, role, technologies }))), plain(enExperience.map(({ id, company, role, technologies }) => ({ id, company, role, technologies }))));
  function translated(original, copy, fields) {
    for (const field of fields) {
      if (original[field] === undefined) continue;
      assert.ok(copy[field], `Missing ${field}`);
      assert.notDeepEqual(plain(copy[field]), plain(original[field]), `Untranslated ${field}`);
      if (Array.isArray(original[field])) assert.equal(copy[field].length, original[field].length, field);
    }
  }
  translated(en.profile, pl.profile, ['description', 'heroDescription']);
  translated(en.profile.about, pl.profile.about, ['start', 'highlight', 'end', 'personal']);
  en.projects.forEach((project, i) => translated(project, pl.projects[i], ['description', 'contributions', 'imageAlt']));
  enExperience.forEach((entry, i) => {
    const copy = plExperience[i];
    translated(entry, copy, ['period', 'summary', 'description', 'overview', 'arrangement', 'contributions']);
    assert.equal(copy.projects?.length, entry.projects?.length);
    entry.projects?.forEach((project, j) => {
      translated(project, copy.projects[j], ['context', 'paragraphs']);
      assert.equal(copy.projects[j].id, project.id);
      assert.deepEqual(plain(copy.projects[j].references.map(({ url }) => url)), plain(project.references.map(({ url }) => url)));
    });
  });
  for (const key of ['goldnat', 'mlynNadSanna']) {
    const original = enStudies[key], copy = plStudies[key];
    translated(original, copy, ['subtitle', 'description', 'coverAlt', 'contributions']);
    assert.deepEqual(plain(copy.technologies), plain(original.technologies));
    assert.equal(copy.sections.length, original.sections.length);
    original.sections.forEach((section, i) => {
      assert.equal(copy.sections[i].id, section.id);
      translated(section, copy.sections[i], ['title', 'paragraphs']);
      assert.equal(copy.sections[i].figures?.length, section.figures?.length);
      section.figures?.forEach((figure, j) => translated(figure, copy.sections[i].figures[j], ['alt', 'caption']));
    });
  }
});

test('18 static pages have matching language links, localized metadata and working internal destinations', () => {
  assert.equal(routes.length * 2, 18);
  for (const locale of ['en', 'pl']) for (const route of routes) {
    const prefix = locale === 'pl' ? 'pl/' : '';
    const html = readPage(prefix + route);
    assert.match(html, new RegExp(`<html[^>]*lang="${locale}"`));
    assert.match(html, new RegExp(`property="og:locale" content="${locale === 'pl' ? 'pl_PL' : 'en_US'}"`));
    const languageLinks = [...html.matchAll(/<a\b[^>]*data-language-link[^>]*>/g)].map(([tag]) => tag);
    assert.equal(languageLinks.length, 2);
    for (const language of ['en', 'pl']) {
      const link = languageLinks.find((tag) => tag.includes(`lang="${language}"`));
      assert.ok(link.includes(`href="/${language === 'pl' ? 'pl/' : ''}${route}"`));
      assert.equal(link.includes('aria-current="true"'), language === locale);
    }
    if (route) assert.ok(html.includes(`"inLanguage":"${locale}"`));
    if (locale === 'pl') {
      assert.match(html, /Przejdź do treści/);
      assert.match(html, /Masz pomysł na projekt\?/);
      assert.doesNotMatch(html, />\s*(?:Back to|Selected technologies|My contribution|Visit live|Professional experience|Read case study|Have something in mind)/);
    }
    for (const [tag, href] of html.matchAll(/<a\b[^>]*href="([^"\s]+)"[^>]*>/g)) {
      if (!href.startsWith('/') && !href.startsWith('#')) continue;
      const url = new URL(href, `https://portfolio.test/${prefix}${route}`);
      assert.ok(existsSync(resolve(root, 'dist', url.pathname.slice(1), 'index.html')), href);
      if (!tag.includes('data-language-link')) assert.equal(url.pathname.startsWith('/pl/'), locale === 'pl', href);
      if (url.hash) assert.ok(readPage(url.pathname.slice(1)).includes(`id="${url.hash.slice(1)}"`), href);
    }
  }
});

test('Polish static hero carries its own copy and translated pause states', () => {
  const html = readPage('pl');
  assert.match(html, /Aplikacje webowe\./);
  assert.match(html, /Narzędzia AI\./);
  assert.match(html, /data-pause-label="Zatrzymaj animację nagłówka"/);
  assert.match(html, /data-resume-label="Wznów animację nagłówka"/);
  assert.doesNotMatch(html, /Web applications\.|Pause headline animation/);
});

test('Polish copy retains the source limits on attribution and delivery status', () => {
  const goldnat = readPage('pl/work/goldnat'), sanna = readPage('pl/work/mlyn-nad-sanna');
  assert.match(goldnat, /prototyp prywatnych ofert i formularzy do testów wewnętrznych/);
  assert.match(goldnat, /Publiczna strona i katalog już działają/);
  assert.match(sanna, /autorem koncepcji wizualnej jest grafik/);
  assert.match(sanna, /nie obsługuje rezerwacji ani zarządzania dostępnością pokoi/);
  const xolvio = readPage('pl/experience/xolvio');
  assert.match(xolvio, /ponad 80 wspólnych komponentów/);
  assert.match(xolvio, /ponad 15 stron gier/);
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const html = readFileSync(join(dist, 'index.html'), 'utf8');

test('each destination supplies its own decorative default transition label', () => {
  for (const [path, label] of [['index.html', 'Homepage'], ['work/goldnat/index.html', 'Goldnat']]) {
    const page = readFileSync(join(dist, path), 'utf8');
    const labels = [...page.matchAll(/<div\b[^>]*data-route-label\b[^>]*>([^<]*)<\/div>/g)];
    assert.equal(labels.length, 1);
    assert.equal(labels[0][1], label);
    assert.match(page, /<div\b[^>]*data-route-overlay\b[^>]*aria-hidden="true"/);
    assert.ok(page.includes(`name="portfolio-transition-label" content="${label}"`));
    assert.doesNotMatch(labels[0][0], /tabindex/);
  }
});

test('the static document contains both real projects without requiring JavaScript', () => {
  assert.match(html, /data-project-section data-project-count="2"/);
  const articles = [...html.matchAll(/<article\b[^>]*data-project\b[\s\S]*?<\/article>/g)].map((match) => match[0]);
  assert.equal(articles.length, 2);
  assert.match(articles[0], /Goldnat/);
  assert.match(articles[1], /Młyn nad Sanną/);
  assert.match(articles[0], /href="\/work\/goldnat\/"/);
  assert.doesNotMatch(articles[0], /target="_blank"/);
  assert.match(articles[1], /target="_blank"/);
  for (const article of articles) {
    const openingTag = article.slice(0, article.indexOf('>') + 1);
    assert.doesNotMatch(openingTag, /\binert(?:\s|=|>)/);
    assert.doesNotMatch(openingTag, /aria-hidden="true"/);
    assert.doesNotMatch(article, /visibility:\s*hidden|opacity:\s*0/);
    const action = article.includes('/work/goldnat/') ? 'Read case study' : 'Visit website';
    assert.ok(article.includes(action));
    assert.match(article, /<picture>/);
    assert.equal([...article.matchAll(/<a\b/g)].length, 1);
    assert.match(article, /data-project-arrival/);
    assert.match(article, /data-project-entry/);
    assert.match(article, /data-project-surface/);
    assert.match(article, /class="project-back" aria-hidden="true"><\/div>/);
    const order = ['data-project-title', '<figure', 'data-project-copy', 'data-project-scope', 'data-project-action'].map((marker) => article.indexOf(marker));
    assert.ok(order.every((position, index) => position >= 0 && (!index || position > order[index - 1])), 'Title, photo, description, scope and action follow the chosen reading order');
    assert.equal(article.split(action).length - 1, 1);
    assert.doesNotMatch(article, /card-arrow/);
    assert.match(article, /<a\b[^>]*draggable="false"/);
    assert.match(article, /<img\b[^>]*draggable="false"/);
  }
});

test('navigation destinations exist once and contact links contain real supplied values', () => {
  for (const id of ['top', 'work', 'experience', 'about', 'stack', 'contact', 'main']) {
    assert.equal([...html.matchAll(new RegExp(`\\bid="${id}"`, 'g'))].length, 1, id);
  }
  assert.match(html, /href="mailto:stojaniuk\.damian@gmail\.com"/);
  assert.match(html, /href="\/work\/goldnat\/"/);
  assert.match(html, /href="https:\/\/mlynnadsanna\.pl\/"/);
  assert.match(html, /Development from supplied design/);
  assert.equal([...html.matchAll(/data-experience-row/g)].length, 6);
  assert.doesNotMatch(html, /<form\b/);
  assert.match(html, /Back to top/);
});

test('hero has two visual variants, a pause control and a stable accessible heading', () => {
  assert.equal([...html.matchAll(/data-hero-slide/g)].length, 2);
  assert.equal([...html.matchAll(/data-hero-text/g)].length, 4);
  assert.match(html, /data-hero-text>Full-Stack<\/span>/);
  assert.match(html, /data-hero-text>Developer<\/span>/);
  assert.match(html, /data-entry-curtain aria-hidden="true"/);
  assert.doesNotMatch(html, /data-hero-char/);
  assert.match(html, /data-hero-pause[^>]*aria-label="Pause headline animation"/);
  assert.match(html, /Scroll to explore/);
  assert.match(html, /<h1[^>]*>Full-stack developer building web applications and AI tools\.<\/h1>/);
  assert.doesNotMatch(html, /hero-pending|data-work-stage|data-project-prev|data-project-next/);
});

test('the stack and the new footer are included in the static document', () => {
  assert.equal([...html.matchAll(/data-stack-tag/g)].length, 18);
  const stack = html.match(/<section id="stack"[\s\S]*?<\/section>/)[0];
  assert.equal([...stack.matchAll(/data-glow-card/g)].length, 18);
  assert.equal([...stack.matchAll(/data-glow-surface/g)].length, 18);
  assert.equal([...stack.matchAll(/class="stack-icon" aria-hidden="true"/g)].length, 18);
  assert.equal([...stack.matchAll(/class="stack-label"/g)].length, 18);
  const stackTiles = [...stack.matchAll(/<li\b[\s\S]*?<\/li>/g)].map((match) => match[0]);
  for (const tile of stackTiles) {
    assert.equal([...tile.matchAll(/<svg\b/g)].length, 1);
    assert.match(tile, /<svg\b[^>]*aria-hidden="true"[^>]*focusable="false"/);
    assert.ok(tile.indexOf('stack-icon') < tile.indexOf('stack-label'));
  }
  assert.doesNotMatch(stack, /<a\b|<button\b|\btabindex=/);
  assert.match(html, /data-cursor-layer aria-hidden="true" hidden/);
  assert.match(html, /Tools I build with\./);
  assert.match(html, /Anthropic API/);
  assert.match(html, /Cloudflare Workers/);
  assert.match(html, /<footer id="contact"/);
  assert.match(html, /Footer navigation/);
});

test('all built image variants and local stylesheet/script assets exist', () => {
  const references = [...html.matchAll(/(?:src|href)="(\/_astro\/[^"?#]+)"/g)].map((match) => match[1]);
  const variants = [...html.matchAll(/srcset="([^"]+)"/g)].flatMap((match) => match[1].split(',').map((item) => item.trim().split(/\s+/)[0]));
  assert.ok(variants.length >= 8);
  for (const reference of [...references, ...variants]) {
    assert.ok(existsSync(join(dist, reference)), `Missing asset: ${reference}`);
  }
});

test('SEO and baseline accessibility are available in the generated HTML', () => {
  const transitionStyle = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)]
    .find((match) => match[1].includes('.route-overlay'));
  assert.ok(transitionStyle, 'Idle curtain styles are inline before first paint');
  assert.notEqual(transitionStyle[1].charCodeAt(0), 0xfeff);
  assert.doesNotMatch(transitionStyle[1], /@view-transition|view-transition-name/);
  assert.match(html, /name="astro-view-transitions-fallback" content="swap"/);
  assert.match(html, /data-astro-transition-persist="route-overlay"/);
  assert.equal([...html.matchAll(/<canvas\b[^>]*\bdata-backdrop\b/g)].length, 1);
  assert.match(html, /<body\b[^>]*>\s*<canvas[^>]*data-backdrop aria-hidden="true"><\/canvas>/);
  assert.match(html, /<html\b[^>]*\blang="en"/);
  assert.match(html, /<meta name="description" content="[^"]+"/);
  assert.match(html, /<meta property="og:image"/);
  assert.match(html, /application\/ld\+json/);
  assert.equal([...html.matchAll(/<h1\b/g)].length, 1);
  assert.match(html, /Skip to content/);
  for (const image of html.matchAll(/<img\b[^>]*>/g)) {
    assert.match(image[0], /alt="[^"]+"/);
    assert.match(image[0], /width="\d+"/);
    assert.match(image[0], /height="\d+"/);
  }
});

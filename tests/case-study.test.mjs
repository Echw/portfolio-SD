import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const html = readFileSync(join(dist, 'work/goldnat/index.html'), 'utf8');

test('Goldnat ships the real copy and correctly distinguishes the live website from staff trials', () => {
  assert.match(html, /long-term vehicle rental with an option to buy/);
  assert.match(html, /monthly payment, initial payment and number of instalments/);
  assert.match(html, /calculator provides a quick reference for staff/);
  assert.match(html, /publication, visibility and availability are separate controls/);
  assert.match(html, /preserves response history and supports corrections through a new link/);
  assert.match(html, /deployed prototype of the private offer and form workflow for staff trials/);
  assert.match(html, /customer rollout following validation/);
  for (const tool of ['TypeScript', 'Next.js', 'Payload CMS', 'PostgreSQL', 'Cloudflare R2']) assert.ok(html.includes(tool));
  assert.doesNotMatch(html, /Daily rate|PLN 420|Illustrative architecture|Example copy|Concept preview|Editorial notes/);
});

test('the standalone case study has accessible navigation, metadata and no homepage intro', () => {
  assert.match(html, /<title>Goldnat/);
  assert.match(html, /<html lang="en"/);
  assert.equal([...html.matchAll(/<h1\b/g)].length, 1);
  assert.match(html, /<h1 id="case-title">Goldnat<\/h1>/);
  assert.doesNotMatch(html, /data-entry-curtain|entry-pending|data-hero-slide|data-project-entry/);
  for (const link of ['/#about', '/#work', '/#stack', '/#experience', '#context', '#contact', '#top']) assert.ok(html.includes(`href="${link}"`), link);
  for (const match of html.matchAll(/href="#([^" ]+)"/g)) assert.ok(html.includes(`id="${match[1]}"`), `Missing target ${match[1]}`);
  for (const link of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) assert.match(link[0], /rel="noopener noreferrer"/);
  assert.match(html, /href="https:\/\/goldnat\.pl\/"/);
  const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.equal(schema['@type'], 'CreativeWork');
  assert.equal(schema.author.name, 'Damian Stojaniuk');
});

test('all four real screenshots have captions and responsive assets without enlargement links', () => {
  const figures = [...html.matchAll(/<figure\b[\s\S]*?<\/figure>/g)].map((m) => m[0]);
  assert.equal(figures.length, 4);
  for (const figure of figures) {
    assert.doesNotMatch(figure, /<a\b|View full size|View full-size/);
    assert.match(figure, /<figcaption>/);
    assert.match(figure, /loading="lazy"/);
  }
  for (const image of html.matchAll(/<img\b[^>]*>/g)) {
    assert.match(image[0], /alt="[^"]+"/);
    assert.match(image[0], /width="\d+"/);
    assert.match(image[0], /height="\d+"/);
  }
  const references = [...html.matchAll(/(?:src|href)="(\/_astro\/[^"?#]+)"/g)].map((m) => m[1]);
  const variants = [...html.matchAll(/srcset="([^"]+)"/g)].flatMap((m) => m[1].split(',').map((item) => item.trim().split(/\s+/)[0]));
  for (const reference of [...references, ...variants]) assert.ok(existsSync(join(dist, reference)), `Missing asset: ${reference}`);
});

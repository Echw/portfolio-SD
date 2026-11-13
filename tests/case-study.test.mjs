import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const html = readFileSync(join(dist, 'work/goldnat/index.html'), 'utf8');
const sanna = readFileSync(join(dist, 'work/mlyn-nad-sanna/index.html'), 'utf8');

test('Sanna publishes the four supplied chapters and credits design separately from implementation', () => {
  const headings = [...sanna.matchAll(/<h2\b[^>]*>([^<]+)<\/h2>/g)].map((match) => match[1]);
  assert.deepEqual(headings.slice(0, 4), [
    'Bringing the design to the web', 'A consistent experience across pages',
    'Content the client can manage', 'Launch and handover',
  ]);
  assert.match(sanna, /The visual design was supplied by a graphic designer/);
  assert.match(sanna, /the visual concept belongs to the designer/);
  assert.match(sanna, /I integrated Sanity CMS/);
  assert.match(sanna, /not a booking engine or a room-availability management system/);
  assert.match(sanna, /transferred the repository, hosting and CMS/);
  for (const text of ['My contribution', 'TypeScript', 'React', 'Next.js', 'Sanity', 'SCSS Modules']) assert.ok(sanna.includes(text));
  assert.doesNotMatch(sanna, /CRM|Editorial notes|Next useful image|View full.size|placeholder/i);
});

test('Sanna has project-specific metadata, accessible links and an independent cover position', () => {
  assert.match(sanna, /<title>Młyn nad Sanną — Case study/);
  assert.match(sanna, /name="description" content="How I developed Młyn nad Sanną/);
  assert.equal([...sanna.matchAll(/<h1\b/g)].length, 1);
  const heading = sanna.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  assert.equal(heading, 'Młyn nad Sanną');
  assert.match(sanna, /--case-cover-position:\s*center 55%/);
  assert.doesNotMatch(html, /--case-cover-position:/);
  assert.match(sanna, /href="https:\/\/mlynnadsanna\.pl\/" target="_blank" rel="noopener noreferrer"/);
  assert.match(sanna, /href="\/#work"/);
  for (const match of sanna.matchAll(/href="#([^" ]+)"/g)) assert.ok(sanna.includes(`id="${match[1]}"`), match[1]);
  const schema = JSON.parse(sanna.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.equal(schema['@type'], 'CreativeWork');
  assert.equal(schema.author.name, 'Damian Stojaniuk');
  assert.equal(schema.about.name, 'Młyn nad Sanną');
  assert.equal(schema.about.url, 'https://mlynnadsanna.pl/');
  assert.ok(schema.name.startsWith('Młyn nad Sanną'));
  for (const img of sanna.matchAll(/<img\b[^>]*>/g)) assert.match(img[0], /alt="[^"]+"/);
  assert.equal([...sanna.matchAll(/class="case-section-copy" data-reveal/g)].length, 4);
});

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
  assert.match(html, /<html\b[^>]*\blang="en"/);
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

for (const [project, markup, figureCount] of [['Goldnat', html, 4], ['Sanna', sanna, 3]]) {
test(`${project} screenshots have captions and responsive assets without enlargement links`, () => {
  const html = markup;
  const figures = [...html.matchAll(/<figure\b[\s\S]*?<\/figure>/g)].map((m) => m[0]);
  assert.equal(figures.length, figureCount);
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
}

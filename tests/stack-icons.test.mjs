import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const base = new URL('../src/assets/stack/', import.meta.url);
const sources = JSON.parse(readFileSync(new URL('sources.json', base), 'utf8'));

test('all 18 local icons retain scalable monochrome vectors and have no interactive/external SVG content', () => {
  assert.equal(sources.length, 18);
  assert.equal(new Set(sources.map(({ file }) => file)).size, 18);
  for (const { file } of sources) {
    const svg = readFileSync(new URL(file, base), 'utf8');
    assert.match(svg, /viewBox="0 0 (?:128 128|24 24)"/, file);
    assert.match(svg, /\bwidth="28"/, file);
    assert.match(svg, /\bheight="28"/, file);
    assert.match(svg, /aria-hidden="true"/);
    assert.match(svg, /focusable="false"/);
    assert.doesNotMatch(svg, /<script\b|<foreignObject\b|<title\b|\bon\w+=|(?:href|src)=|#[0-9a-f]{3,8}(?:"|;)/i, file);
    for (const [, color] of svg.matchAll(/(?:fill|stroke)="([^"]+)"/g)) {
      assert.ok(['currentColor', 'none', 'transparent'].includes(color), file + ': ' + color);
    }
  }
});

test('every vendored icon has an immutable source and its full library license', () => {
  for (const { source, license, adaptations } of sources) {
    assert.match(source, /^https:\/\/raw\.githubusercontent\.com\/(?:devicons\/devicon|lobehub\/lobe-icons|lucide-icons\/lucide)\/[a-f0-9]{40}\//);
    const text = readFileSync(new URL(license, base), 'utf8');
    assert.match(text, /Permission|permission/);
    assert.match(text, /Copyright/);
    assert.ok(text.length > 700);
    assert.match(adaptations, /paths and viewBox retained/);
  }
});

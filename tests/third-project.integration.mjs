import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const dataPath = new URL('../src/data/portfolio.ts', import.meta.url);
const original = readFileSync(dataPath, 'utf8');
const fixture = "\nprojects.push({ ...projects[0], id: 'qa-third-project', name: 'QA third project' });\n";
const astroPackage = JSON.parse(readFileSync(new URL('../node_modules/astro/package.json', import.meta.url), 'utf8'));
const cli = fileURLToPath(new URL('../node_modules/astro/' + (typeof astroPackage.bin === 'string' ? astroPackage.bin : astroPackage.bin.astro), import.meta.url));
function build() {
  const result = spawnSync(process.execPath, [cli, 'build'], { stdio: 'inherit', cwd: fileURLToPath(new URL('../', import.meta.url)) });
  assert.equal(result.status, 0, 'Astro build must succeed');
}
try {
  writeFileSync(dataPath, original + fixture);
  build();
  const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
  assert.equal([...html.matchAll(/<article\b[^>]*data-project\b/g)].length, 3);
  assert.match(html, /title-qa-third-project/);
  assert.match(html, /QA third project/);
  assert.match(html, /class="work-count"[^>]*>\(03\)/);
  assert.equal([...html.matchAll(/data-project-entry/g)].length, 3);
  assert.equal([...html.matchAll(/class="project-back"/g)].length, 3);
  console.log('PASS: a third data record renders a third linked card and updates the count.');
} finally {
  writeFileSync(dataPath, original);
  build();
  console.log('Original project data and the two-project production build restored.');
}

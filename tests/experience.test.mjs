import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

const exports = {};
runInNewContext(ts.transpileModule(readFileSync(new URL('../src/data/experience.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, { exports });
const { experience, experienceHref } = exports;
const read = (path) => readFileSync(new URL(`../dist/${path}`, import.meta.url), 'utf8');
const home = read('index.html');
const text = (html) => html.replace(/<[^>]+>/g, '').replaceAll('&amp;', '&').replaceAll('&#39;', "'").replaceAll('&quot;', '"');
const expected = [
  ['flyps', 'Flyps', 'Senior Full-Stack Developer', 'Nov 2025–Present', 'TypeScript|React|Next.js|Node.js|MCP|Vercel AI SDK|Playwright'],
  ['thebrain', 'TheBrain Software House', 'Senior Full-Stack Developer', 'May 2025–Oct 2025', 'TypeScript|React|tRPC|OpenAI API|Phaser|Monaco Editor'],
  ['xolvio', 'Xolv.io', 'Full-Stack Developer', 'Jul 2021–Apr 2025', 'TypeScript|React|Vue.js|Node.js|GraphQL|AWS CDK/Lambda|Contentful|Web Serial|WebUSB'],
  ['leaderna', 'Leaderna Platform', 'Full-Stack Developer', 'Oct 2022–May 2023', 'TypeScript|React|D3.js|GraphQL|MongoDB|Auth0'],
  ['eleader', 'eLeader', 'Junior Software Developer', 'Jan 2020–May 2021', 'C#|.NET|JavaScript|T-SQL|WordPress|PHP'],
  ['plum', 'PLUM', 'Intern / Junior Developer', 'Jul 2018–Jun 2019', 'C|C++|STM32|C#|.NET|WPF'],
];

test('experience has stable unique IDs, source titles/dates/technologies and timeline order', () => {
  assert.deepEqual(JSON.parse(JSON.stringify(experience.map((entry) => [entry.id, entry.company, entry.role, entry.period, entry.technologies.join('|')]))), expected);
  assert.equal(new Set(experience.map((entry) => entry.id)).size, 6);
  for (const entry of experience) {
    assert.ok(entry.description && entry.overview);
    for (const field of ['cover', 'image', 'url']) assert.equal(entry[field], undefined);
  }
});

test('each homepage row is one ordinary internal link, with no expanded role copy', () => {
  const rows = [...home.matchAll(/<a\b[^>]*data-experience-row[^>]*>[\s\S]*?<\/a>/g)].map((match) => match[0]);
  assert.equal(rows.length, 6);
  experience.forEach((entry, index) => {
    const row = rows[index];
    assert.ok(row.includes(`href="${experienceHref(entry.id)}"`));
    for (const value of [entry.company, entry.role, entry.period]) assert.ok(text(row).includes(value));
    assert.equal([...row.matchAll(/<a\b/g)].length, 1);
    assert.doesNotMatch(row, /onclick|target=|tabindex=|aria-hidden="true"[^>]*data-experience-row/);
    assert.ok(!text(row).includes(entry.overview));
  });
});

for (const entry of experience) {
  test(`${entry.company}: complete text-only static page, semantic structure and shared navigation`, () => {
    const html = read(`experience/${entry.id}/index.html`);
    const article = html.match(/<article\b[\s\S]*?<\/article>/)[0];
    const copy = text(article);
    assert.equal([...html.matchAll(/<h1\b/g)].length, 1);
    assert.ok(copy.includes(entry.overview));
    for (const item of [...(entry.contributions ?? []), ...entry.technologies]) assert.ok(copy.includes(item), item);
    assert.equal([...article.matchAll(/href="\/#experience"/g)].length, 2);
    assert.equal(copy.split('Back to experience').length - 1, 2);
    assert.match(copy, /Professional experience/);
    assert.doesNotMatch(article, /<img\b|<picture\b|<figure\b|<svg\b|case-cover|placeholder|Independent work|Explore the project|Visit live website|Editorial notes/i);
    assert.ok(html.includes(`<title>${entry.company} — Professional experience · Damian Stojaniuk</title>`));
    assert.ok(html.includes(`name="portfolio-transition-label" content="${entry.company}"`));
    assert.match(html, /name="description" content="[^"]+"/);
    assert.match(html, /data-astro-transition-persist="route-overlay"/);
    assert.match(html, /data-backdrop/);
    assert.match(html, /data-cursor-layer/);
    assert.match(article, /data-reveal/);
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
    assert.equal(new Set(ids).size, ids.length);
    for (const match of html.matchAll(/href="#([^" ]+)"/g)) assert.ok(ids.includes(match[1]), match[1]);
    for (const match of html.matchAll(/aria-labelledby="([^"]+)"/g)) for (const id of match[1].split(' ')) assert.ok(ids.includes(id));
    for (const href of ['/#top', '/#about', '/#work', '/#stack', '/#experience', '#contact', '#top']) assert.ok(html.includes(`href="${href}"`));
    const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    assert.equal(schema['@type'], 'AboutPage');
    assert.deepEqual(schema.about, { '@type': 'Organization', name: entry.company });
    assert.equal(schema.author.name, 'Damian Stojaniuk');
    assert.equal(schema.inLanguage, 'en');
    for (const project of entry.projects ?? []) {
      assert.ok(copy.includes(project.title));
      assert.ok(copy.includes(project.context));
      for (const paragraph of project.paragraphs) assert.ok(copy.includes(paragraph));
      for (const reference of project.references) assert.ok(article.includes(`href="${reference.url}"`));
    }
    for (const link of article.matchAll(/<a\b[^>]*target="_blank"[\s\S]*?<\/a>/g)) {
      assert.match(link[0], /rel="noopener noreferrer"/);
      assert.match(link[0], /opens in a new tab/);
    }
  });
}

test('team attribution, source metrics, overlap and short eLeader scope survive consolidation', () => {
  const xolvio = text(read('experience/xolvio/index.html'));
  for (const phrase of ['core team', 'more than 80', 'more than 15', 'NBA 2K', 'Borderlands', 'Civilization', 'roll back changes', 'Zendesk', 'visual regression', 'output current', 'dimming parameters', 'programming profiles', 'programming sessions', 'cloud infrastructure']) assert.ok(xolvio.includes(phrase), phrase);
  assert.equal(xolvio.split('more than 80').length - 1, 1);
  const leaderna = text(read('experience/leaderna/index.html'));
  for (const phrase of ['Part-time alongside Xolv.io', 'substantial part', 'product team', 'conventional Gantt chart', 'D3.js']) assert.ok(leaderna.includes(phrase), phrase);
  const eleader = read('experience/eleader/index.html').match(/<article\b[\s\S]*?<\/article>/)[0];
  assert.equal([...eleader.matchAll(/<section\b/g)].length, 2);
  assert.doesNotMatch(eleader, /My contribution|Public reference/);
});

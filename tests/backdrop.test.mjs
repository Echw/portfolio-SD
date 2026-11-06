import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import { createBackdropField } from '../src/scripts/backdrop-field.ts';

const source = ts.transpileModule(readFileSync(new URL('../src/scripts/backdrop.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

function harness({ interactive = true, compact = false, unavailable = false } = {}) {
  const windowEvents = new Map(), documentEvents = new Map(), ticker = new Set(), transforms = [], disturbances = [], fields = [], errors = [];
  let draws = 0, frameGlows = 0, failDraw = false;
  const savedStyles = [];
  const ctx = {
    shadowBlur: 0,
    clearRect() { if (failDraw) throw Error('Drawing unavailable'); draws++; frameGlows = 0; },
    save() { savedStyles.push({ shadowBlur: this.shadowBlur, shadowColor: this.shadowColor, lineWidth: this.lineWidth, strokeStyle: this.strokeStyle }); },
    restore() { Object.assign(this, savedStyles.pop()); },
    setTransform: (...values) => transforms.push(values), beginPath() {}, moveTo() {}, lineTo() {}, quadraticCurveTo() {}, stroke() { if (this.shadowBlur > 0) frameGlows++; },
    createLinearGradient: () => ({ addColorStop() {} }),
  };
  const canvas = { width: 0, height: 0, hidden: false, getContext: () => unavailable ? null : ctx };
  const window = { innerWidth: 1536, innerHeight: 900, devicePixelRatio: 3, scrollY: 0,
    addEventListener: (name, callback) => windowEvents.set(name, callback), removeEventListener: (name) => windowEvents.delete(name) };
  const document = { hidden: false, querySelector: () => canvas,
    addEventListener: (name, callback) => documentEvents.set(name, callback), removeEventListener: (name) => documentEvents.delete(name) };
  const exports = {};
  runInNewContext(source, { exports, window, document,
    require(name) {
      if (name === 'gsap') return { gsap: { ticker: { add: (callback) => ticker.add(callback), remove: (callback) => ticker.delete(callback) } } };
      return { createBackdropField(...args) {
        const field = createBackdropField(...args), disturb = field.disturb;
        field.disturb = (...values) => { disturbances.push(values); return disturb(...values); };
        fields.push(field); return field;
      } };
    }, console: { error: (...values) => errors.push(values) },
  });
  const cleanup = exports.initializeBackdrop({ interactive, compact });
  const move = (values = {}) => windowEvents.get('pointermove')?.({ pointerType: 'mouse', clientX: 400, clientY: 350, ...values });
  return { window, document, canvas, windowEvents, documentEvents, ticker, transforms, disturbances, fields, errors, cleanup, move,
    draws: () => draws, glows: () => frameGlows, fail: () => { failDraw = true; }, tick() { [...ticker].forEach((callback) => callback(0, 1000 / 60)); } };
}

test('idle background draws once, caps DPR, ignores document scroll and sleeps after the pointer settles', () => {
  const h = harness(); assert.equal(h.draws(), 1); assert.equal(h.ticker.size, 0);
  assert.equal(h.canvas.width, 2304); assert.equal(h.canvas.height, 1350); assert.equal(h.transforms[0][0], 1.5);
  assert.equal(h.windowEvents.has('scroll'), false);
  h.window.scrollY = 3000;
  h.move({ pageX: 400, pageY: 3350 }); h.move({ pageX: 400, pageY: 5350 });
  assert.deepEqual(h.disturbances.map((values) => values.slice(0, 2)), [[400, 350], [400, 350]]);
  assert.equal(h.ticker.size, 1);
  assert.equal(h.glows(), 0); h.tick(); assert.ok(h.glows() > 0, 'Only disturbed lines receive the halo');
  for (let frame = 0; frame < 90 && h.ticker.size; frame++) h.tick();
  assert.equal(h.ticker.size, 0); assert.equal(h.glows(), 0, 'The halo clears at rest'); assert.ok(h.draws() > 1); h.cleanup();
});

test('touch, leaving the window and hidden tabs stop motion; resize rebuilds only viewport geometry', () => {
  const h = harness();
  for (const stop of [() => h.move({ pointerType: 'touch' }), () => h.windowEvents.get('pointerout')({ relatedTarget: null }), () => h.windowEvents.get('blur')(), () => { h.document.hidden = true; h.documentEvents.get('visibilitychange')(); h.document.hidden = false; }]) {
    h.move(); h.tick(); assert.equal(h.ticker.size, 1);
    stop(); assert.equal(h.ticker.size, 0);
    assert.ok(h.fields.at(-1).lines.flat().every((point) => point.offset === 0));
  }
  h.window.innerWidth = 1024; h.windowEvents.get('resize')();
  assert.equal(h.canvas.width, 1536); assert.equal(h.ticker.size, 0);
  h.cleanup(); assert.equal(h.windowEvents.size, 0); assert.equal(h.documentEvents.size, 0);
});

test('static reduced-motion/touch variants do not subscribe to pointer input or the ticker', () => {
  const h = harness({ interactive: false, compact: true });
  assert.equal(h.fields[0].lines.length, 12); assert.equal(h.windowEvents.has('pointermove'), false);
  assert.equal(h.ticker.size, 0); assert.equal(h.draws(), 1);
  h.cleanup(); assert.equal(h.windowEvents.size, 0);
});

test('missing canvas context and drawing errors fall back independently and remove ticker/listeners', () => {
  const missing = harness({ unavailable: true });
  assert.equal(missing.canvas.hidden, true); assert.equal(missing.windowEvents.size, 0); missing.cleanup();
  const h = harness(); h.move(); h.fail(); h.tick();
  assert.equal(h.errors.length, 1); assert.equal(h.canvas.hidden, true);
  assert.equal(h.ticker.size, 0); assert.equal(h.windowEvents.size, 0); assert.equal(h.documentEvents.size, 0);
  h.cleanup();
});

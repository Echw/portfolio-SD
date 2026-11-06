import { test } from 'node:test';
import assert from 'node:assert/strict';
import { projectLayout } from '../src/scripts/project-layout.ts';

const budget = {
  width: 1440, height: 900, headerHeight: 112, padding: 72, heading: 25, headingGap: 24,
  contentHeights: [310, 340], frameWidths: [560, 560],
};

test('the scene fills the available viewport while both inset images retain 2:1 and leave room for real copy', () => {
  for (const [width, height] of [[1024, 720], [1440, 900], [1536, 1024]]) {
    const compact = height <= 800 ? { padding: 48, heading: 22, headingGap: 20, contentHeights: [255, 285], frameWidths: [370, 370] } : {};
    const input = { ...budget, ...compact, width, height };
    const layout = projectLayout(input);
    assert.equal(layout.fit, true);
    assert.equal(layout.sceneHeight + input.headerHeight + 16, height);
    assert.equal(layout.cardHeight + input.padding + input.heading + input.headingGap, layout.sceneHeight);
    assert.equal(layout.imageWidth / layout.imageHeight, 2);
    assert.ok(layout.imageWidth <= Math.min(...input.frameWidths));
    assert.ok(layout.imageHeight + Math.max(...input.contentHeights) <= layout.cardHeight);
  }
  assert.ok(projectLayout({ ...budget, height: 1024 }).imageHeight > 200, 'The old panoramic-strip cap is gone');
});

test('long/zoomed copy switches to natural flow rather than clipping or destroying the crop', () => {
  const layout = projectLayout({ ...budget, height: 720, contentHeights: [500, 560] });
  assert.equal(layout.fit, false);
  assert.equal(layout.imageHeight, null);
  assert.equal(layout.imageWidth, null);
});

test('mobile, short viewports and additional projects retain their natural row layout', () => {
  for (const changes of [{ width: 390 }, { width: 768 }, { height: 600 }, { contentHeights: [200, 220, 210] }, { contentHeights: [] }]) {
    assert.equal(projectLayout({ ...budget, ...changes }), null);
  }
});

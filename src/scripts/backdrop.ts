import { gsap } from 'gsap';
import { createBackdropField } from './backdrop-field';

interface BackdropOptions { interactive: boolean; compact: boolean }

/** One fixed canvas. The ticker is attached only while a pointer disturbance is settling. */
export function initializeBackdrop({ interactive, compact }: BackdropOptions): () => void {
  const canvas = document.querySelector<HTMLCanvasElement>('[data-backdrop]');
  if (!canvas) return () => {};
  let context: CanvasRenderingContext2D | null;
  try { context = canvas.getContext('2d', { alpha: true }); }
  catch { canvas.hidden = true; return () => {}; }
  if (!context) { canvas.hidden = true; return () => {}; }
  const ctx = context;
  let field: ReturnType<typeof createBackdropField>;
  let width = 0, height = 0;
  let pixelRatio = 1;
  let running = false;
  let disposed = false;
  let pointerX: number | undefined;
  const stop = () => {
    if (running) gsap.ticker.remove(tick);
    running = false;
  };
  const draw = () => {
    ctx.clearRect(0, 0, width, height);
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    field.lines.forEach((line) => {
      ctx.beginPath();
      ctx.moveTo(line[0].x + line[0].offset, line[0].y);
      for (let index = 1; index < line.length - 1; index++) {
        const point = line[index], next = line[index + 1];
        ctx.quadraticCurveTo(point.x + point.offset, point.y, (point.x + point.offset + next.x + next.offset) / 2, (point.y + next.y) / 2);
      }
      const last = line[line.length - 1];
      ctx.lineTo(last.x + last.offset, last.y);
      ctx.strokeStyle = 'rgba(132, 112, 96, 0.24)';
      ctx.stroke();
      if (line.some((point) => point.heat > .002)) {
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        line.forEach((point) => gradient.addColorStop(Math.max(0, Math.min(1, point.y / height)), 'rgba(255, 92, 40, ' + point.heat.toFixed(4) + ')'));
        ctx.save();
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.shadowColor = '#ff5c28';
        ctx.shadowBlur = 8 * pixelRatio;
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      }
    });
  };
  const fail = (error: unknown) => {
    cleanup();
    canvas!.hidden = true;
    console.error('Interactive background unavailable; the plain background remains.', error);
  };
  function tick(_time: number, deltaMilliseconds: number) {
    if (disposed) return;
    try {
      const moving = field.step((deltaMilliseconds || 16.667) / 1000);
      draw();
      if (!moving) stop();
    } catch (error) { fail(error); }
  }
  const resize = () => {
    if (disposed) return;
    try {
      stop(); pointerX = undefined;
      width = Math.max(1, window.innerWidth); height = Math.max(1, window.innerHeight);
      const dpr = Math.max(1, Math.min(1.5, window.devicePixelRatio || 1));
      pixelRatio = dpr;
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      field = createBackdropField(width, height, compact);
      draw(); canvas.hidden = false;
    } catch (error) { fail(error); }
  };
  const rest = () => {
    if (disposed) return;
    try { stop(); pointerX = undefined; field.reset(); draw(); }
    catch (error) { fail(error); }
  };
  const move = (event: PointerEvent) => {
    if (disposed || document.hidden) return;
    if (event.pointerType !== 'mouse') { rest(); return; }
    try {
      const movement = pointerX === undefined ? 0 : event.clientX - pointerX;
      pointerX = event.clientX;
      const affected = field.disturb(event.clientX, event.clientY, movement);
      if (affected && !running) { running = true; gsap.ticker.add(tick); }
    } catch (error) { fail(error); }
  };
  const out = (event: PointerEvent) => { if (!event.relatedTarget) rest(); };
  const visibility = () => { if (document.hidden) rest(); };
  function cleanup() {
    // Preserve the last rendered frame for navigation snapshots and BFCache.
    disposed = true; stop();
    window.removeEventListener('resize', resize);
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerout', out);
    window.removeEventListener('blur', rest);
    document.removeEventListener('visibilitychange', visibility);
  }
  window.addEventListener('resize', resize);
  if (interactive) {
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerout', out);
    window.addEventListener('blur', rest);
    document.addEventListener('visibilitychange', visibility);
  }
  resize();
  return cleanup;
}

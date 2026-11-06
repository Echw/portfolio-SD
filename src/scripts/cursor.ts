import { gsap } from 'gsap';

/** Native cursor is the default. It is hidden only after a successful, positioned custom-cursor frame. */
export function initializeCursor(): () => void {
  const layer = document.querySelector<HTMLElement>('[data-cursor-layer]');
  const dot = layer?.querySelector<HTMLElement>('[data-cursor-dot]');
  const ring = layer?.querySelector<HTMLElement>('[data-cursor-ring]');
  if (!layer || !dot || !ring) return () => {};
  const root = document.documentElement;
  const ringX = gsap.quickTo(ring, 'x', { duration: .18, ease: 'power3.out' });
  const ringY = gsap.quickTo(ring, 'y', { duration: .18, ease: 'power3.out' });
  const dotX = gsap.quickSetter(dot, 'x', 'px');
  const dotY = gsap.quickSetter(dot, 'y', 'px');
  let point: { x: number; y: number } | undefined;
  let frame = 0;
  let disposed = false;
  let failed = false;
  const hide = () => {
    point = undefined;
    cancelAnimationFrame(frame); frame = 0;
    root.classList.remove('has-custom-cursor');
    layer.hidden = true;
    layer.classList.remove('is-pressed');
    delete layer.dataset.mode;
    ringX.tween.pause(); ringY.tween.pause();
  };
  const updateMode = () => {
    if (!point) return false;
    const target = document.elementFromPoint(point.x, point.y);
    if (!target || target.closest('input, textarea, [contenteditable="true"]')) { hide(); return false; }
    const interactive = target.closest('a[href], button:not(:disabled), [role="button"]:not([aria-disabled="true"])');
    layer.dataset.mode = interactive ? 'interactive' : target.closest('[data-glow-card]') ? 'tile' : 'default';
    return true;
  };
  const fail = (error: unknown) => {
    failed = true;
    hide();
    console.error('Custom cursor unavailable; native cursor restored.', error);
  };
  const move = (event: PointerEvent) => {
    if (disposed || failed) return;
    if (event.pointerType !== 'mouse' || document.hidden) { hide(); return; }
    try {
      const first = layer.hidden;
      point = { x: event.clientX, y: event.clientY };
      if (!updateMode()) return;
      if (first) {
        gsap.set([dot, ring], { x: point.x, y: point.y });
        ringX(point.x, point.x); ringY(point.y, point.y);
      }
      else { dotX(point.x); dotY(point.y); ringX(point.x); ringY(point.y); }
      layer.classList.toggle('is-pressed', Boolean(event.buttons & 1));
      layer.hidden = false;
      root.classList.add('has-custom-cursor');
    } catch (error) { fail(error); }
  };
  const refresh = () => {
    if (disposed || failed || !point || frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      try { updateMode(); } catch (error) { fail(error); }
    });
  };
  const down = (event: PointerEvent) => { move(event); if (!layer.hidden) layer.classList.add('is-pressed'); };
  const up = () => layer.classList.remove('is-pressed');
  const out = (event: PointerEvent) => { if (!event.relatedTarget) hide(); };
  const visibility = () => { if (document.hidden) hide(); };
  window.addEventListener('pointermove', move, { passive: true });
  window.addEventListener('pointerdown', down, { passive: true });
  window.addEventListener('pointerup', up, { passive: true });
  window.addEventListener('pointercancel', hide);
  window.addEventListener('pointerout', out);
  window.addEventListener('keydown', hide);
  window.addEventListener('blur', hide);
  window.addEventListener('resize', hide);
  window.addEventListener('scroll', refresh, { passive: true });
  document.addEventListener('visibilitychange', visibility);
  return () => {
    disposed = true; hide();
    ringX.tween.kill(); ringY.tween.kill();
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerdown', down);
    window.removeEventListener('pointerup', up);
    window.removeEventListener('pointercancel', hide);
    window.removeEventListener('pointerout', out);
    window.removeEventListener('keydown', hide);
    window.removeEventListener('blur', hide);
    window.removeEventListener('resize', hide);
    window.removeEventListener('scroll', refresh);
    document.removeEventListener('visibilitychange', visibility);
    gsap.set([dot, ring], { clearProps: 'transform' });
  };
}

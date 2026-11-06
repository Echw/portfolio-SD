import { gsap } from 'gsap';
import { createCardPointer } from './card-pointer';

/** Shared light for project links and informational Stack tiles; only project surfaces tilt. */
export function initializeCards(root: HTMLElement): () => void {
  const pointers: ReturnType<typeof createCardPointer>[] = [];
  const cleanup = Array.from(root.querySelectorAll<HTMLElement>('[data-glow-card]')).map((card) => {
    const surface = card.querySelector<HTMLElement>('[data-glow-surface]')!;
    const tilts = card.hasAttribute('data-glow-tilt');
    const rotateX = tilts ? gsap.quickTo(surface, 'rotationX', { duration: .35, ease: 'power3.out' }) : undefined;
    const rotateY = tilts ? gsap.quickTo(surface, 'rotationY', { duration: .35, ease: 'power3.out' }) : undefined;
    const light = gsap.quickTo(surface, '--light', { duration: .24, ease: 'power2.out' });
    const lightX = gsap.quickTo(surface, '--mouse-x', { duration: .16, ease: 'power2.out' });
    const lightY = gsap.quickTo(surface, '--mouse-y', { duration: .16, ease: 'power2.out' });
    const pointer = createCardPointer({
      bounds: () => card.getBoundingClientRect(),
      ready: () => card.dataset.projectReady !== 'false' && !document.hidden && !card.matches(':focus-visible'),
      ownsPoint: (point) => {
        const target = document.elementFromPoint(point.x, point.y);
        return target === card || Boolean(target && card.contains(target));
      },
      request: (callback) => requestAnimationFrame(callback),
      cancel: (frame) => cancelAnimationFrame(frame),
      paint(x, y, tilt) {
        card.classList.add('is-hovering');
        lightX(x); lightY(y); light(1);
        rotateX?.(tilt.x); rotateY?.(tilt.y);
      },
      reset() {
        card.classList.remove('is-hovering');
        light(0); rotateX?.(0); rotateY?.(0);
      },
    });
    pointers.push(pointer);
    const move = (event: PointerEvent) => {
      if (event.pointerType === 'touch') { pointer.reset(); return; }
      pointer.move({ x: event.clientX, y: event.clientY });
    };
    const reset = () => pointer.reset();
    const refresh = () => pointer.refresh();
    const focus = () => { if (card.matches(':focus-visible')) pointer.reset(); };
    card.addEventListener('pointerenter', move);
    card.addEventListener('pointermove', move);
    card.addEventListener('pointerleave', reset);
    card.addEventListener('pointercancel', reset);
    card.addEventListener('focus', focus);
    card.addEventListener('project:revealed', refresh);

    return () => {
      pointer.destroy();
      [rotateX, rotateY, light, lightX, lightY].forEach((update) => update?.tween.kill());
      card.removeEventListener('pointerenter', move);
      card.removeEventListener('pointermove', move);
      card.removeEventListener('pointerleave', reset);
      card.removeEventListener('pointercancel', reset);
      card.removeEventListener('focus', focus);
      card.removeEventListener('project:revealed', refresh);
      card.classList.remove('is-hovering');
      ['--mouse-x', '--mouse-y', '--light'].forEach((property) => surface.style.removeProperty(property));
      if (tilts) gsap.set(surface, { clearProps: 'transform' });
    };
  });
  const refresh = () => pointers.forEach((pointer) => pointer.refresh());
  const reset = () => pointers.forEach((pointer) => pointer.reset());
  const visibility = () => { if (document.hidden) reset(); };
  window.addEventListener('scroll', refresh, { passive: true });
  window.addEventListener('resize', refresh);
  window.addEventListener('blur', reset);
  document.addEventListener('visibilitychange', visibility);
  return () => {
    window.removeEventListener('scroll', refresh);
    window.removeEventListener('resize', refresh);
    window.removeEventListener('blur', reset);
    document.removeEventListener('visibilitychange', visibility);
    cleanup.forEach((dispose) => dispose());
  };
}

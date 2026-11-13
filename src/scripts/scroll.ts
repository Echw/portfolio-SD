import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createScrollHold } from './scroll-hold';
import { navigate } from 'astro:transitions/client';

/** Single scroll owner. Native keyboard/touch behavior remains available. */
export function initializeScroll(header: HTMLElement, smooth: boolean) {
  let destroyed = false;
  const lenis = smooth ? new Lenis({ lerp: .1, smoothWheel: true, syncTouch: false, autoRaf: false, anchors: false }) : undefined;
  const tick = (time: number) => lenis?.raf(time * 1000);
  if (lenis) {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.lagSmoothing(0);
    gsap.ticker.add(tick);
  }
  const holds = createScrollHold({
    block() {
      document.documentElement.classList.add('scroll-is-held');
      lenis?.stop();
    },
    unblock() {
      document.documentElement.classList.remove('scroll-is-held');
      lenis?.start();
    },
    schedule: (callback, delay) => window.setTimeout(callback, delay),
    cancel: (timer) => window.clearTimeout(timer as number),
  });
  const goTo = (target: HTMLElement, immediate = false, focus = false) => {
    holds.interrupt();
    const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - header.offsetHeight - 16);
    const finish = () => {
      if (!focus) return;
      if (!target.hasAttribute('tabindex')) {
        target.setAttribute('tabindex', '-1');
        target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
      }
      target.focus({ preventScroll: true });
    };
    if (lenis) lenis.scrollTo(top, { immediate, onComplete: finish });
    else { window.scrollTo(0, top); finish(); }
  };
  const click = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href^="#"]') : null;
    const hash = anchor?.getAttribute('href');
    const target = hash ? document.getElementById(hash.slice(1)) : null;
    if (!target) return;
    event.preventDefault();
    // Astro keeps its own history index and saved positions. Never replace them with null.
    if (document.querySelector('meta[name="astro-view-transitions-enabled"]')) {
      const top = window.scrollY;
      const moving = navigate(hash!, { sourceElement: anchor! });
      // The router updates the fragment synchronously; Lenis owns the visible movement.
      window.scrollTo(0, top);
      void moving.then(() => { if (!destroyed) goTo(target, event.detail === 0 || !smooth, true); });
    } else {
      if (location.hash !== hash) history.pushState(history.state, '', hash);
      goTo(target, event.detail === 0 || !smooth, true);
    }
  };
  const key = (event: KeyboardEvent) => {
    if (holds.active()) {
      if (event.key === 'Escape' || event.key === 'Tab') holds.interrupt();
      else if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) {
        event.preventDefault();
        return;
      }
    }
    if (lenis && ['Tab', 'Escape', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) {
      lenis.scrollTo(lenis.actualScroll, { immediate: true });
    }
  };
  const preventScroll = (event: WheelEvent | TouchEvent) => {
    if (!holds.active() || event.ctrlKey || ('touches' in event && event.touches.length > 1)) return;
    if (event.cancelable) event.preventDefault();
  };
  const interrupt = () => holds.interrupt();
  const visibility = () => { if (document.hidden) interrupt(); };
  document.addEventListener('click', click, true);
  document.addEventListener('visibilitychange', visibility);
  window.addEventListener('keydown', key);
  window.addEventListener('wheel', preventScroll, { passive: false });
  window.addEventListener('touchmove', preventScroll, { passive: false });
  window.addEventListener('resize', interrupt);
  window.addEventListener('popstate', interrupt);
  return {
    goTo,
    pause() { holds.interrupt(); lenis?.stop(); },
    resume() { if (!destroyed && !holds.active()) lenis?.start(); },
    hold(finish: () => void, section?: HTMLElement | null) {
      const alreadyHeld = holds.active();
      const release = holds.acquire(finish);
      try {
        if (!alreadyHeld && section) {
          // Frame the desktop scene or active natural-flow card during arrival.
          const top = Math.max(0, section.getBoundingClientRect().top + window.scrollY - header.offsetHeight - 16);
          if (lenis) lenis.scrollTo(top, { force: true, duration: .45, lerp: 0, easing: (time: number) => 1 - Math.pow(1 - time, 3) });
          else window.scrollTo(0, top);
        }
      } catch (error) { release(); throw error; }
      return release;
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      holds.destroy();
      document.removeEventListener('click', click, true);
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('keydown', key);
      window.removeEventListener('wheel', preventScroll);
      window.removeEventListener('touchmove', preventScroll);
      window.removeEventListener('resize', interrupt);
      window.removeEventListener('popstate', interrupt);
      if (lenis) {
        gsap.ticker.remove(tick);
        lenis.off('scroll', ScrollTrigger.update);
        lenis.destroy();
      }
    },
  };
}

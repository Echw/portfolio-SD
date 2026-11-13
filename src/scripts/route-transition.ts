import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import type { TransitionBeforePreparationEvent, TransitionBeforeSwapEvent } from 'astro:transitions/client';
import { destroyPortfolio, initializePortfolio, pausePortfolioScroll, resumePortfolioScroll } from './motion';

/** Resolve against the incoming document, never the persisted overlay's old text. */
export function routeLabel(
  page: string,
  hash: string,
  title: string,
  sections: Record<string, string> = {
    '#work': 'All projects', '#about': 'About', '#stack': 'Stack',
    '#experience': 'Experience', '#contact': 'Contact',
  },
): string {
  return page === 'home' ? sections[hash] || title : title;
}

interface Session {
  event: TransitionBeforePreparationEvent;
  overlay: HTMLElement;
  panel: HTMLElement;
  label: HTMLElement;
  animate: boolean;
  swapped: boolean;
  cancellations: Set<() => void>;
  timer: number;
  abort: () => void;
  title: Promise<void>;
}

let disposeRouter: (() => void) | undefined;

/** One persistent live curtain; Astro handles document loading and history on every engine. */
export function initializeRouteTransitions(): () => void {
  if (disposeRouter) return disposeRouter;
  gsap.registerPlugin(CustomEase);
  const ease = CustomEase.create('route-panel', '.65,0,.35,1');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let active: Session | undefined;
  const inert = new Map<HTMLElement, boolean>();

  const blockContent = () => {
    document.querySelectorAll<HTMLElement>('main, [data-header]').forEach((element) => {
      if (!inert.has(element)) inert.set(element, element.inert);
      element.inert = true;
    });
    document.documentElement.dataset.routeBusy = 'true';
    pausePortfolioScroll();
  };
  const unblockContent = () => {
    inert.forEach((value, element) => { element.inert = value; });
    inert.clear();
    delete document.documentElement.dataset.routeBusy;
    resumePortfolioScroll();
  };
  const resetVisual = (session: Session) => {
    session.overlay.removeAttribute('data-active');
    session.overlay.removeAttribute('data-phase');
    gsap.set(session.panel, { clearProps: 'transform' });
    gsap.set(session.label, { clearProps: 'transform,opacity' });
  };
  const cancelAnimations = (session: Session) => {
    [...session.cancellations].forEach((cancel) => cancel());
  };
  const finish = (session: Session) => {
    cancelAnimations(session);
    window.clearTimeout(session.timer);
    session.event.signal.removeEventListener('abort', session.abort);
    if (active !== session) return;
    resetVisual(session);
    active = undefined;
    unblockContent();
  };
  const animate = (session: Session, build: (timeline: gsap.core.Timeline) => void) => {
    if (!session.animate || active !== session) return Promise.resolve();
    return new Promise<void>((resolve) => {
      const timeline = gsap.timeline({ paused: true });
      const settle = () => { session.cancellations.delete(cancel); resolve(); };
      const cancel = () => { timeline.kill(); settle(); };
      session.cancellations.add(cancel);
      timeline.eventCallback('onComplete', settle);
      build(timeline);
      timeline.play();
    });
  };
  const recover = (session: Session) => {
    if (active !== session) return;
    const { to, navigationType } = session.event;
    finish(session);
    if (navigationType === 'traverse' || navigationType === 'replace' || session.swapped) location.replace(to.href);
    else location.assign(to.href);
  };

  const beforePreparation = (event: TransitionBeforePreparationEvent) => {
    if (event.from.pathname === event.to.pathname && event.from.search === event.to.search) return;
    if (active) finish(active);
    const overlay = document.querySelector<HTMLElement>('[data-route-overlay]');
    const panel = overlay?.querySelector<HTMLElement>('[data-route-curtain]');
    const label = overlay?.querySelector<HTMLElement>('[data-route-label]');
    if (!overlay || !panel || !label) return;
    const session: Session = {
      event, overlay, panel, label, animate: !reduced.matches && !document.hidden,
      swapped: false, cancellations: new Set(), timer: 0, abort: () => {}, title: Promise.resolve(),
    };
    active = session;
    session.abort = () => finish(session);
    event.signal.addEventListener('abort', session.abort, { once: true });
    window.__portfolioEntry?.finish();
    window.dispatchEvent(new Event('portfolio:route-arrive'));
    blockContent();
    // Set the collapsed state BEFORE exposing the overlay: no full-screen flash.
    gsap.set(panel, { xPercent: 0, scaleX: 0 });
    gsap.set(label, { opacity: 0, y: 8 });
    if (session.animate) overlay.setAttribute('data-active', '');
    overlay.dataset.phase = 'cover';
    const cover = animate(session, (timeline) => {
      timeline.to(panel, { scaleX: 1, duration: .55, ease });
    });
    let rejectDeadline: (error: Error) => void;
    const deadline = new Promise<never>((_, reject) => { rejectDeadline = reject; });
    session.timer = window.setTimeout(() => {
      if (session.swapped) recover(session);
      else rejectDeadline(new Error('Navigation preparation timed out'));
    }, 10000);
    const loader = event.loader;
    event.loader = async () => {
      try {
        await Promise.race([Promise.all([loader(), cover]), deadline]);
        if (event.defaultPrevented || event.signal.aborted) finish(session);
      } catch (error) {
        // Let Astro perform its normal full-document navigation on preparation failure.
        event.preventDefault();
        finish(session);
        if (!event.signal.aborted) console.warn('Using standard page navigation.', error);
      }
    };
  };

  const beforeSwap = (event: TransitionBeforeSwapEvent) => {
    // Suppress native snapshots in supported browsers too: GSAP owns the visual effect.
    event.viewTransition.ready.catch(() => {});
    event.viewTransition.skipTransition();
    destroyPortfolio();
    event.newDocument.documentElement.dataset.routeArrival = 'true';
    const session = active;
    if (!session || session.event.signal !== event.signal) return;
    event.newDocument.documentElement.dataset.routeBusy = 'true';
    const title = event.newDocument.querySelector('meta[name="portfolio-transition-label"]')?.getAttribute('content') || 'Homepage';
    const sectionLabels = event.newDocument.body.dataset.sectionLabels;
    session.label.textContent = routeLabel(
      event.newDocument.body.dataset.page || '', event.to.hash, title,
      sectionLabels ? JSON.parse(sectionLabels) : undefined,
    );
  };

  const afterSwap = () => {
    const session = active;
    if (!session) return;
    session.swapped = true;
    blockContent();
    session.overlay.dataset.phase = 'title';
    session.title = animate(session, (timeline) => {
      timeline.to(session.label, { opacity: 1, y: 0, duration: .15, ease })
        .to(session.label, { opacity: 0, y: -8, duration: .15, ease }, .45);
    });
  };

  const pageLoad = async () => {
    const session = active;
    try {
      await initializePortfolio({ restoreHash: session ? session.event.navigationType !== 'traverse' : undefined });
      if (!session || active !== session || !session.swapped) return;
      pausePortfolioScroll();
      await session.title;
      if (active !== session) return;
      session.overlay.dataset.phase = 'reveal';
      await animate(session, (timeline) => {
        timeline.to(session.panel, { xPercent: 100, duration: .55, ease });
      });
      if (active !== session) return;
      finish(session);
      if (session.event.navigationType !== 'traverse') {
        document.querySelector<HTMLElement>('main')?.focus({ preventScroll: true });
      }
    } catch (error) {
      console.error('Page initialization interrupted.', error);
      if (session) recover(session);
    }
  };
  const skipMotion = () => {
    if (!active) return;
    active.animate = false;
    cancelAnimations(active);
    if (active.swapped) resetVisual(active);
    else gsap.set(active.panel, { xPercent: 0, scaleX: 1 });
  };
  const changeMotion = () => { if (reduced.matches) skipMotion(); };
  const visibility = () => { if (document.hidden) skipMotion(); };
  const input = (event: WheelEvent | TouchEvent | KeyboardEvent) => {
    if (!active) return;
    if ('key' in event && ['Escape', 'Tab'].includes(event.key)) { skipMotion(); return; }
    if (event.ctrlKey || ('touches' in event && event.touches.length > 1)) return;
    if (!('key' in event) || ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) {
      event.preventDefault();
    }
  };
  const pageHide = () => { if (active) finish(active); };
  document.addEventListener('astro:before-preparation', beforePreparation);
  document.addEventListener('astro:before-swap', beforeSwap);
  document.addEventListener('astro:after-swap', afterSwap);
  document.addEventListener('astro:page-load', pageLoad);
  document.addEventListener('visibilitychange', visibility);
  window.addEventListener('resize', skipMotion);
  window.addEventListener('pagehide', pageHide);
  window.addEventListener('wheel', input, { capture: true, passive: false });
  window.addEventListener('touchmove', input, { capture: true, passive: false });
  window.addEventListener('keydown', input, true);
  reduced.addEventListener('change', changeMotion);
  disposeRouter = () => {
    pageHide();
    destroyPortfolio();
    document.removeEventListener('astro:before-preparation', beforePreparation);
    document.removeEventListener('astro:before-swap', beforeSwap);
    document.removeEventListener('astro:after-swap', afterSwap);
    document.removeEventListener('astro:page-load', pageLoad);
    document.removeEventListener('visibilitychange', visibility);
    window.removeEventListener('resize', skipMotion);
    window.removeEventListener('pagehide', pageHide);
    window.removeEventListener('wheel', input, true);
    window.removeEventListener('touchmove', input, true);
    window.removeEventListener('keydown', input, true);
    reduced.removeEventListener('change', changeMotion);
    disposeRouter = undefined;
  };
  return disposeRouter;
}

if (import.meta.hot) import.meta.hot.dispose(() => disposeRouter?.());

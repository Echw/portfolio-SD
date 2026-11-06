import { gsap } from 'gsap';
import { heroHeadlines } from '../data/portfolio';
import { createTypewriterController } from './typewriter-controller';

declare global {
  interface Window {
    __portfolioEntry?: { pending: boolean; finish(): void };
  }
}

export function initializeHero(hero: HTMLElement): () => void {
  const slides = Array.from(hero.querySelectorAll<HTMLElement>('[data-hero-slide]'));
  const button = hero.querySelector<HTMLButtonElement>('[data-hero-pause]');
  if (!slides.length || !button) { window.__portfolioEntry?.finish(); return () => {}; }
  const outputs = slides.map((slide) => Array.from(slide.querySelectorAll<HTMLElement>('[data-hero-text]')));
  const caret = document.createElement('span');
  caret.className = 'hero-caret';
  caret.setAttribute('aria-hidden', 'true');
  let entryAnimation: gsap.core.Timeline | undefined;
  let failed = false;
  const entry = window.__portfolioEntry;
  const curtain = document.querySelector<HTMLElement>('[data-entry-curtain]');
  const supporting = [document.querySelector<HTMLElement>('[data-header]'), hero.querySelector<HTMLElement>('.hero-foot')].filter((element): element is HTMLElement => Boolean(element));

  const clearEntry = () => {
    entryAnimation?.kill();
    gsap.set([...supporting, ...(curtain ? [curtain] : [])], { clearProps: 'opacity,visibility,transform' });
  };
  const restore = () => {
    caret.remove();
    hero.classList.remove('hero-is-enhanced', 'hero-is-active', 'hero-is-holding');
    slides.forEach((slide) => slide.classList.remove('is-current'));
    outputs.forEach((rows, index) => rows.forEach((output, row) => {
      output.textContent = index === 0 ? heroHeadlines[0].lines[row] : '';
    }));
    button.hidden = true;
  };
  hero.classList.add('hero-is-enhanced');
  const controller = createTypewriterController({
    headlines: heroHeadlines,
    entryDelay: entry?.pending ? 240 : 0,
    clock: {
      now: () => performance.now(),
      schedule: (callback, delay) => window.setTimeout(callback, delay),
      cancel: (handle) => window.clearTimeout(handle as number),
    },
    render(state) {
      slides.forEach((slide, index) => slide.classList.toggle('is-current', index === state.index));
      outputs[state.index].forEach((output, row) => { output.textContent = state.lines[row]; });
      outputs[state.index][state.cursorRow].parentElement?.append(caret);
      hero.classList.toggle('hero-is-holding', state.phase === 'hold' || state.phase === 'emptyPause');
      hero.classList.toggle('hero-is-active', !state.blocked);
    },
    error(error) {
      failed = true;
      entry?.finish();
      clearEntry();
      restore();
      console.error('Typewriter unavailable; the full first headline remains visible.', error);
    },
  });

  const finishEntry = () => { clearEntry(); controller.finishEntry(); };
  window.addEventListener('portfolio:entry-end', finishEntry);
  try {
    if (entry?.pending && curtain && !failed) {
      entryAnimation = gsap.timeline({ onComplete: () => entry.finish() })
        .to(curtain, { yPercent: -100, duration: .85, ease: 'power3.inOut' }, 0)
        .fromTo(supporting, { opacity: 0 }, { opacity: 1, duration: .23, ease: 'power2.out' }, .62);
    } else entry?.finish();

    const rect = hero.getBoundingClientRect();
    controller.setVisible(rect.bottom > 0 && rect.top < window.innerHeight);
    const observer = new IntersectionObserver(([event]) => controller.setVisible(event.isIntersecting), { threshold: .1 });
    const visibility = () => controller.setDocumentVisible(!document.hidden);
    const toggle = () => {
      const paused = !controller.state().userPaused;
      controller.setPaused(paused);
      button.setAttribute('aria-pressed', String(paused));
      button.setAttribute('aria-label', paused ? 'Resume headline animation' : 'Pause headline animation');
      button.classList.toggle('is-paused', paused);
    };
    if (!failed) button.hidden = false;
    button.addEventListener('click', toggle);
    document.addEventListener('visibilitychange', visibility);
    visibility();
    observer.observe(hero);

    return () => {
      observer.disconnect();
      controller.destroy();
      window.removeEventListener('portfolio:entry-end', finishEntry);
      entry?.finish();
      clearEntry();
      button.removeEventListener('click', toggle);
      document.removeEventListener('visibilitychange', visibility);
      button.classList.remove('is-paused');
      button.setAttribute('aria-pressed', 'false');
      button.setAttribute('aria-label', 'Pause headline animation');
      restore();
    };
  } catch (error) {
    controller.destroy();
    window.removeEventListener('portfolio:entry-end', finishEntry);
    entry?.finish(); clearEntry(); restore();
    throw error;
  }
}

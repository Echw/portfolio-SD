import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initializeHero } from './hero';
import { initializeCards } from './cards';
import { initializeScroll } from './scroll';
import { initializeProjectEntry } from './project-entry';
import { initializeProjectLayout } from './project-layout';
import { initializeCursor } from './cursor';
import { initializeBackdrop } from './backdrop';

let teardown: (() => void) | undefined;
let initializedOnce = false;

/** Readable HTML is the baseline; every enhancement is scoped and reversible. */
export async function initializePortfolio(): Promise<void> {
  teardown?.();
  const restoreInitialHash = !initializedOnce;
  initializedOnce = true;
  gsap.registerPlugin(ScrollTrigger);
  const root = document.querySelector<HTMLElement>('main');
  const header = document.querySelector<HTMLElement>('[data-header]');
  if (!root || !header) return;
  const media = gsap.matchMedia();
  let disposed = false;
  let scroll: ReturnType<typeof initializeScroll> | undefined;
  let disposeProjectLayout: (() => void) | undefined;

  const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
  const imageError = (event: Event) => {
    if (event.target instanceof HTMLImageElement) event.target.closest('.card-visual')?.classList.add('has-image-error');
  };
  root.querySelectorAll<HTMLImageElement>('.card-visual img').forEach((image) => {
    if (image.complete && !image.naturalWidth) image.closest('.card-visual')?.classList.add('has-image-error');
  });
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
  root.addEventListener('error', imageError, true);
  teardown = () => {
    disposed = true;
    window.__portfolioEntry?.finish();
    disposeProjectLayout?.();
    media.revert();
    scroll?.destroy();
    scroll = undefined;
    window.removeEventListener('scroll', updateHeader);
    root.removeEventListener('error', imageError, true);
  };

  try {
    await Promise.race([document.fonts.ready, new Promise((resolve) => window.setTimeout(resolve, 800))]);
    if (disposed) return;
    disposeProjectLayout = initializeProjectLayout(root, header, () => ScrollTrigger.refresh());
    media.add({
      normal: '(prefers-reduced-motion: no-preference)',
      fine: '(hover: hover) and (pointer: fine)',
      wide: '(min-width: 900px)',
    }, (context) => {
      const normal = Boolean(context.conditions?.normal);
      const fine = Boolean(context.conditions?.fine);
      if (!normal) window.__portfolioEntry?.finish();
      const dispose: (() => void)[] = [];
      dispose.push(initializeBackdrop({ interactive: normal && fine, compact: !fine }));
      const scopedScroll = initializeScroll(header, normal);
      scroll = scopedScroll;
      dispose.push(() => {
        scopedScroll.destroy();
        if (scroll === scopedScroll) scroll = undefined;
      });
      if (normal) {
        const hero = root.querySelector<HTMLElement>('[data-hero]');
        if (hero) dispose.push(initializeHero(hero));
        dispose.push(initializeProjectEntry(root, scopedScroll.hold));
        if (fine) {
          dispose.push(initializeCards(root));
          dispose.push(initializeCursor());
        }
        gsap.from('[data-experience-row]', {
          autoAlpha: 0, y: 48, duration: 1.1, stagger: .1, ease: 'expo.out',
          scrollTrigger: { trigger: '.experience-list', start: 'top 82%', once: true },
        });
        root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((element) => {
          gsap.from(element, {
            autoAlpha: 0, y: 20, duration: .8, ease: 'expo.out',
            scrollTrigger: { trigger: element, start: 'top 90%', once: true },
          });
        });
        const words = Array.from(root.querySelectorAll<HTMLElement>('[data-about-word]'));
        if (words.length) {
          gsap.fromTo(words, { color: '#a49b93', filter: 'blur(.65px)' }, {
            color: (index: number) => words[index].classList.contains('about-word--accent') ? '#ff5c28' : '#f5f0eb',
            filter: 'blur(0px)', duration: .3, stagger: .055, ease: 'none',
            scrollTrigger: { trigger: '[data-about-copy]', start: 'top 78%', end: 'bottom 40%', scrub: .45 },
          });
        }
        gsap.from('[data-stack-tag]', {
          autoAlpha: 0, y: 12, duration: .45, stagger: .035, ease: 'power2.out',
          scrollTrigger: { trigger: '.stack-list', start: 'top 90%', once: true },
        });
        gsap.from('[data-footer-word]', {
          opacity: 0, filter: 'blur(4px)', y: 8, duration: .8, stagger: .08, ease: 'power3.out',
          scrollTrigger: { trigger: '.contact-title', start: 'top 88%', once: true },
        });
        root.querySelectorAll<HTMLElement>('[data-footer-part]').forEach((element) => {
          gsap.from(element, {
            autoAlpha: 0, y: 12, duration: .7, ease: 'power3.out',
            scrollTrigger: { trigger: element, start: 'top 92%', once: true },
          });
        });
      }
      return () => dispose.reverse().forEach((cleanup) => cleanup());
    });

    requestAnimationFrame(() => {
      if (disposed) return;
      ScrollTrigger.refresh();
      if (restoreInitialHash && location.hash) {
        const target = document.getElementById(location.hash.slice(1));
        if (target) scroll?.goTo(target, true);
      }
    });
  } catch (error) {
    teardown();
    console.error('Motion unavailable; the static portfolio remains readable.', error);
  }
}

const onPageHide = () => teardown?.();
const onPageShow = (event: PageTransitionEvent) => { if (event.persisted) initializePortfolio(); };
window.addEventListener('pagehide', onPageHide);
window.addEventListener('pageshow', onPageShow);
if (import.meta.hot) import.meta.hot.dispose(() => {
  teardown?.();
  window.removeEventListener('pagehide', onPageHide);
  window.removeEventListener('pageshow', onPageShow);
});

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/** Entrance and pointer motion never write transforms on the same element. */
export function initializeProjectEntry(root: HTMLElement, hold: (finish: () => void, section?: HTMLElement | null) => () => void): () => void {
  const cleanups: (() => void)[] = [];
  try {
    root.querySelectorAll<HTMLElement>('[data-project-card]').forEach((card, index) => {
      const entry = card.querySelector<HTMLElement>('[data-project-entry]');
      const arrival = card.querySelector<HTMLElement>('[data-project-arrival]');
      if (!entry || !arrival) return;
      let animation: gsap.core.Timeline | undefined;
      let trigger: ScrollTrigger | undefined;
      let releaseScroll: (() => void) | undefined;
      const finish = () => {
        animation?.kill(); trigger?.kill();
        gsap.set(entry, { clearProps: 'transform' });
        gsap.set(arrival, { clearProps: 'transform,opacity' });
        entry.classList.remove('is-entering');
        card.dataset.projectReady = 'true';
        card.dataset.projectRevealed = 'true';
        releaseScroll?.();
        releaseScroll = undefined;
        card.dispatchEvent(new Event('project:revealed'));
      };
      // Keyboard navigation must never wait for the reveal or delay.
      const focus = () => finish();
      card.addEventListener('focus', focus);
      cleanups.push(() => {
        animation?.kill(); trigger?.kill();
        releaseScroll?.();
        releaseScroll = undefined;
        card.removeEventListener('focus', focus);
        entry.classList.remove('is-entering');
        delete card.dataset.projectReady;
        gsap.set(entry, { clearProps: 'transform' });
        gsap.set(arrival, { clearProps: 'transform,opacity' });
      });
      if (card.dataset.projectRevealed || card === document.activeElement || card.getBoundingClientRect().bottom <= 0) {
        finish(); return;
      }
      card.dataset.projectReady = 'false';
      entry.classList.add('is-entering');
      gsap.set(entry, { rotationY: 180 });
      gsap.set(arrival, { y: 64, opacity: 0 });
      const columns = window.innerWidth >= 900 ? 2 : 1;
      const delay = (index % columns) * .16;
      const arrivalDuration = .65;
      // Both cards arrive first. Only then does the staggered turn reveal their fronts.
      const turnStart = arrivalDuration + (columns - 1) * .16 + .08;
      animation = gsap.timeline({ paused: true, onComplete: finish })
        .to(arrival, { opacity: 1, duration: .18, ease: 'none' }, delay)
        .to(arrival, { y: 0, duration: arrivalDuration, ease: 'power3.out' }, delay)
        .to(entry, { rotationY: 0, duration: 1.1, ease: 'power2.inOut' }, turnStart + delay);
      trigger = ScrollTrigger.create({
        trigger: card, start: 'top 50%', once: true,
        onEnter: () => {
          try {
            const section = card.closest<HTMLElement>('[data-project-section]');
            releaseScroll = hold(finish, section?.dataset.projectFit === 'true' ? section : card);
            // Measure at trigger time, not initialization: the starting edge is below the viewport.
            const belowViewport = Math.max(64, window.innerHeight - card.getBoundingClientRect().top + 24);
            gsap.set(arrival, { y: belowViewport });
            animation?.invalidate().play();
          } catch (error) {
            finish();
            console.error('Project entrance interrupted; scrolling remains available.', error);
          }
        },
      });
    });
  } catch (error) {
    cleanups.reverse().forEach((cleanup) => cleanup());
    console.error('Project entrance unavailable; all projects remain visible.', error);
    return () => {};
  }
  return () => cleanups.reverse().forEach((cleanup) => cleanup());
}

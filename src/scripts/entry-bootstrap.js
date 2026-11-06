/* Runs in the head before first paint. Static HTML is the fail-open default. */
(() => {
  const root = document.documentElement;
  const navigation = performance.getEntriesByType('navigation')[0];
  if (window.__portfolioEntry || location.hash || window.scrollY > 8 || document.hidden ||
      navigation?.type === 'back_forward' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let timeout;
  const events = ['pointerdown', 'wheel', 'touchstart', 'keydown', 'scroll', 'pagehide', 'visibilitychange'];
  const entry = {
    pending: true,
    finish() {
      if (!entry.pending) return;
      entry.pending = false;
      clearTimeout(timeout);
      root.classList.remove('entry-pending');
      events.forEach((event) => window.removeEventListener(event, finish, true));
      window.dispatchEvent(new Event('portfolio:entry-end'));
    },
  };
  const finish = () => entry.finish();
  window.__portfolioEntry = entry;
  root.classList.add('entry-pending');
  events.forEach((event) => window.addEventListener(event, finish, { capture: true, passive: true }));
  timeout = setTimeout(finish, 3000);
})();

/* Native document navigation owns loading, cancellation and history.
 * The shared panel stays behind the page; only its snapshot moves above it.
 */
(() => {
  if (!('onpageswap' in window) || !('onpagereveal' in window)) return;
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let active;
  const cancel = () => {
    active?.skipTransition();
    active = undefined;
  };
  root.classList.add('route-transitions');

  const track = (transition) => {
    active = transition;
    // Skipped/unsupported snapshots reject ready even when finished resolves.
    transition.ready.catch(() => {});
    const finish = () => {
      if (active !== transition) return;
      active = undefined;
    };
    transition.finished.then(finish, finish);
  };

  window.addEventListener('pageswap', (event) => {
    const transition = event.viewTransition;
    if (!transition) return;
    const panel = document.querySelector('[data-route-curtain]');
    if (reduced.matches || !panel) { transition.skipTransition(); return; }
    track(transition);
  });

  window.addEventListener('pagereveal', (event) => {
    const transition = event.viewTransition;
    if (!transition) return;
    // The destination must not play a second page intro behind the curtain.
    root.dataset.routeArrival = 'true';
    window.__portfolioEntry?.finish();
    window.dispatchEvent(new Event('portfolio:route-arrive'));
    if (reduced.matches) { transition.skipTransition(); return; }
    // Resolve from the destination URL before its snapshot, also on BFCache restores.
    const label = document.querySelector('[data-route-label]');
    if (label && document.body.dataset.page === 'home') {
      const sections = {
        '#work': 'All projects',
        '#about': 'About',
        '#stack': 'Stack',
        '#experience': 'Experience',
        '#contact': 'Contact',
      };
      label.textContent = sections[window.location.hash] || label.dataset.routeLabel;
    }
    track(transition);
  });

  window.addEventListener('resize', cancel);
  reduced.addEventListener('change', () => { if (reduced.matches) cancel(); });
})();

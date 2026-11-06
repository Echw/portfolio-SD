interface ViewportBudget {
  width: number;
  height: number;
  headerHeight: number;
  padding: number;
  heading: number;
  headingGap: number;
  contentHeights: number[];
  frameWidths: number[];
}

/** Natural text measurements never include the space allocated to the photograph or flexible summary row. */
export function projectLayout(budget: ViewportBudget) {
  const count = budget.contentHeights.length;
  if (budget.width < 1024 || budget.height < 720 || count !== 2) return null;
  const sceneHeight = budget.height - budget.headerHeight - 16;
  const cardHeight = sceneHeight - budget.padding - budget.heading - budget.headingGap;
  const available = cardHeight - Math.max(...budget.contentHeights);
  const imageHeight = Math.floor(Math.min(cardHeight * .37, Math.min(...budget.frameWidths) / 2, available));
  if (imageHeight < 140) return { fit: false, sceneHeight, cardHeight, imageHeight: null, imageWidth: null };
  return { fit: true, sceneHeight, cardHeight, imageHeight, imageWidth: imageHeight * 2 };
}

export function initializeProjectLayout(root: HTMLElement, header: HTMLElement, changed: () => void): () => void {
  const section = root.querySelector<HTMLElement>('[data-project-section]');
  const heading = section?.querySelector<HTMLElement>('.work-heading');
  const fronts = Array.from(section?.querySelectorAll<HTMLElement>('[data-project-surface]') ?? []);
  if (!section || !heading || !fronts.length) return () => {};
  const roles = ['[data-project-title]', '[data-project-copy]', '[data-project-scope]', '[data-project-action]'];
  const blocks = fronts.map((front) => roles.map((role) => front.querySelector<HTMLElement>(role)!));
  let frame = 0;
  let disposed = false;
  let previous = '';
  const number = (value: string) => Number.parseFloat(value) || 0;
  const properties = ['--project-scene-height', '--project-image-height', '--project-image-width'];
  const clear = () => {
    properties.forEach((property) => section.style.removeProperty(property));
    delete section.dataset.projectFit;
  };
  const measure = () => {
    frame = 0;
    if (disposed) return;
    const sectionStyle = getComputedStyle(section);
    const headingStyle = getComputedStyle(heading);
    const styles = fronts.map((front) => getComputedStyle(front));
    const layout = projectLayout({
      width: window.innerWidth, height: window.innerHeight,
      headerHeight: header.offsetHeight,
      padding: number(sectionStyle.paddingTop) + number(sectionStyle.paddingBottom),
      heading: heading.offsetHeight,
      headingGap: number(sectionStyle.rowGap) || number(headingStyle.marginBottom),
      contentHeights: blocks.map((group, index) => {
        const style = styles[index];
        return group.reduce((height, block) => height + block.offsetHeight, 0) +
          number(style.paddingTop) + number(style.paddingBottom) +
          number(style.borderTopWidth) + number(style.borderBottomWidth) +
          number(style.rowGap) * 4 + 4;
      }),
      frameWidths: fronts.map((front, index) => front.clientWidth - number(styles[index].paddingLeft) - number(styles[index].paddingRight)),
    });
    const signature = JSON.stringify(layout);
    if (signature === previous) return;
    previous = signature;
    clear();
    if (layout) {
      section.dataset.projectFit = String(layout.fit);
      if (layout.fit) {
        section.style.setProperty('--project-scene-height', layout.sceneHeight + 'px');
        section.style.setProperty('--project-image-height', layout.imageHeight + 'px');
        section.style.setProperty('--project-image-width', layout.imageWidth + 'px');
      }
    }
    changed();
  };
  const schedule = () => { if (!disposed && !frame) frame = requestAnimationFrame(measure); };
  const observer = new ResizeObserver(schedule);
  [section, header, heading, ...fronts, ...blocks.flat()].forEach((element) => observer.observe(element));
  window.addEventListener('resize', schedule);
  document.fonts.addEventListener('loadingdone', schedule);
  measure();
  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    observer.disconnect();
    window.removeEventListener('resize', schedule);
    document.fonts.removeEventListener('loadingdone', schedule);
    clear();
  };
}

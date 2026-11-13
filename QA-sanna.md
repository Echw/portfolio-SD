# Młyn nad Sanną — QA, 13 November 2026

## Coverage inventory

- Sanna and Goldnat: hero, title, subtitle, live link, cover ratio/position, all chapters, contribution, technologies, footer and reveal elements.
- Homepage: Sanna copy, contributions, internal card link and card content fit.
- Navigation: card → case study → All projects; name → Homepage; header/footer section links; Explore, Contact and Back to top anchors; Back/Forward and restored scroll.
- Transition: persistent HTML curtain, project and destination labels, 550/600/550 ms sequence; reduced motion skips the curtain.
- Viewports: desktop 1440×1000, mobile 390×844, narrow 320×740, tablet 768×1024. Check title bounds, horizontal overflow and cover ratios. Goldnat screenshots keep their original ratios and have no enlargement links.
- Exploratory cases: direct chapter URL, resizing at a breakpoint, history after an anchor, keyboard navigation during a transition.

## Assets

The existing `src/assets/mlyn.webp` is used as the photographic cover. Its crop is configured per project (`center 55%`); Goldnat retains its existing `center 75%` default.

All three illustrations are now present in `src/assets/sanna/`:

- `sanna-home-desktop.jpg` (1440×720) → “Bringing the design to the web”. Captured from https://mlynnadsanna.pl/ on 13 November 2026, showing the complete hero and navigation.
- `sanna-room-desktop.jpg` (1440×1372) → “A consistent experience across pages”. Captured from https://mlynnadsanna.pl/pokoje/pokoj-01 on 13 November 2026, showing the capacity bar and full room-information section with name, price, photograph and amenities. This is a section capture, not the complete page.
- `sanity-room-editor.png` (1496×1123) → “Content the client can manage”. Supplied by the user as `Downloads/Snapzy_2026-11-13_14-39-13_683.png`, copied unchanged. It shows room visibility, naming and presentation controls without account details.

The two public-site captures were taken in Chromium after fonts/images loaded; the analytics banner was dismissed using “Odrzuć”. No page content, forms or CMS data were edited. Original screenshot proportions are preserved by `CaseStudyFigure`, with responsive image variants and no enlargement links. Photography and visual-design authorship remain with their original authors.

## Results

Verified in local headless Chromium 151.0.7922.34 through Playwright. Screenshots are saved in `output/sanna-qa/`; navigation and history observations are in `functional-results.json` there. Firefox, Safari/WebKit and physical phones were not tested in this task.

- Both heroes visually inspected at 1440×1000 and 390×844; Sanna additionally at 320×740 and 768×1024. The two-line title fits without horizontal overflow. Cover ratios are 2:1 on desktop/tablet and 4:3 on mobile; Sanna uses 55%, Goldnat retains 75%.
- All four Sanna chapters, contribution, technologies, end links and shared footer inspected. Existing reveal animations expose the text during scrolling. No blank illustration frames, invented UI, lightboxes or enlargement links were added.
- Homepage card inspected on desktop and mobile; supplied English copy, CMS wording and contributions are present. Both cards navigate internally.
- Verified card → case study → All projects, name → Homepage, and Goldnat navigation. The same HTML overlay element persists across navigation. Its observed sequence lasted about 1.67 seconds; unit tests assert the configured 550/600/550 ms phases.
- Verified labels: Młyn nad Sanną, Goldnat, Homepage, All projects, About, Stack and Experience. Contact remains a local footer anchor; its route-label mapping is covered by the existing unit test.
- Explore, Contact and Back to top anchors, footer section links, page Back/Forward and anchor Back/Forward checked. Browser testing exposed an existing Lenis anchor tween overwriting the position restored by Astro. Anchor movement now settles in 900 ms, saves its final position while preserving Astro's history index, and stops the old tween on popstate. Final mobile history results: Sanna 719 → 0 → 719 px; Goldnat 698 → 0 → 698 px.
- Direct `#content-management` entry lands below the header. Reduced motion navigates without the curtain and leaves all reveal elements visible. Switching reduced motion on in an already-open page also restores readable content after the media-query update.
- Exploratory checks included breakpoint resizing, scrolling in both directions, history following an anchor, pointer interaction and Tab during the curtain. No stuck inert content or browser page errors observed.
- Goldnat screenshots retain full original proportions on desktop/mobile, with readable explanatory captions. Fine text inside desktop admin captures remains small at phone width; these captures are not cropped or enlarged.

Validation: `npm.cmd run build`, `npm.cmd run check` (0 errors, warnings or hints), `npm.cmd test` (70 tests), and `npm.cmd run test:projects` passed. The project-count integration test restored the original two-card data after its fixture build. The final scroll fix was followed by another build, type check, test run and browser history check.

## Illustration follow-up

After adding all three assets, the production build and type check were repeated. The existing figure/asset regression test now covers both case studies (71 tests total). All three Sanna images loaded in Chromium at 1440×1000 and 390×844, retaining their source proportions without horizontal overflow or enlargement links. Captions remain readable on mobile; fine labels within the full desktop screenshots, especially Sanity, are small at phone width. No crop or artificial UI was introduced. Evidence: `output/sanna-qa/illustration-*.png` and `public-screen-desktop-*.png`.

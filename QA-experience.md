# Professional experience — QA, 13 November 2026

## Coverage inventory

- Six homepage links, order, concise copy, hover and keyboard focus; direct loading and ClientRouter navigation to every company.
- Text-only hero, full company name, role, dates, overview, contribution, selected work, references, technologies, both return links and shared footer. Initial viewport must show the company and role without clipped text.
- Long names at desktop 1440×1000, tablet 768×1024, mobile 390×844 and narrow mobile 320×740; short eLeader and extended Xolv.io content, no horizontal overflow or empty sections.
- Persistent curtain and full company labels; Homepage, Experience, All projects and section labels. Header/footer navigation, local Contact/Back to top, Back/Forward and restored positions.
- Reveal visibility after scrolling, reduced motion and JavaScript-disabled navigation. Semantic HTML, unique h1, metadata and organization schema; external references announce new tabs.
- Goldnat and Sanna: unchanged source, hero/cover and internal navigation regression checks.
- Exploratory cases: direct project fragment, resize during a transition, keyboard interruption, history after local anchors.

## Results

Verified locally through Playwright in **headless Chromium 156.0.8078.4**. Viewports: **1440×1000, 768×1024, 390×844 and 320×740**. Mobile checks emulate touch/viewport behavior; no physical phones, Firefox, Safari/WebKit or screen reader were tested.

- All six pages loaded directly and through homepage links. Both “Back to experience” links on every page returned to `/#experience`. All six links also worked with JavaScript disabled and with reduced motion enabled.
- Full company labels were checked during the live curtain; the same overlay DOM element persisted. Existing unit tests, extended to all six companies, verify the unchanged 550/600/550 ms sequence. TheBrain's title phase was also captured visually.
- Name → Homepage, header About/Work, all four footer destinations, local Contact/Back to top, and direct `#hatch-lighting` entry passed. The fragment landed below the fixed header. Existing label tests also cover Contact.
- Back/Forward restored Xolv.io's desktop position **779 → 779 px** and mobile position **599 → 600 px**. Local-anchor history restored the departure position **3056 → 3056 px**, then Forward returned to the top. The departure position includes scrolling to the clicked link.
- Tab/Enter opened a company and activated its top return link. Focus outlines and row hover were inspected visually. Resize and Tab during the curtain released the transition without leaving inert content. No page errors were reported in the recorded session.
- Every article's reveal elements became visible after scrolling into their trigger region. Reduced motion kept all reveals visible and the curtain hidden. A short reveal near the bottom of the viewport correctly waits until its existing 90% trigger is crossed; no runtime changes were needed.
- All six pages passed horizontal document and text-bound checks at all four widths. TheBrain, Leaderna, eLeader and Xolv.io heroes were captured at each size; representative desktop/tablet/mobile/narrow screenshots were visually reviewed. Company names and roles fit; heroes use natural height. Contribution lists, both Xolv.io project sections, Leaderna's project, technologies, return links and the shared footer were inspected in representative desktop/mobile views.
- No empty sections, photographic covers, placeholder media or fabricated metrics were found. eLeader contains only the role and technologies. Xolv.io's project-specific contributions are consolidated into the selected-work prose; the remaining role-wide bullets stay under “My contribution”. Leaderna retains the substantial team contribution and part-time overlap.
- Goldnat and Sanna heroes/covers were visually checked at 1440×1000 and 390×844; card navigation, project labels and All projects returns passed. Their templates, data, assets, layout and case-study CSS were not edited. Their existing HTML/asset regression tests passed.

## UI refinements from QA

| Before | After | Why |
| --- | --- | --- |
| Intrinsic grid sizing could let long company names crowd adjacent columns. | Timeline columns use `minmax(0, …)`. | Names can wrap within the existing layout. |
| The small arrow could wrap onto a line by itself on mobile. | Company text and arrow share a flex row. | The click affordance remains beside the name. |

## Validation and evidence

`npm.cmd run build` passed (9 pages); `npm.cmd run check` passed (0 errors, warnings or hints); `npm.cmd test` passed (**81 tests**); `npm.cmd run test:projects` passed and restored the two-project production build. Final checks followed the last CSS adjustment. `git diff --check` passed.

Screenshots and observed results are in `output/experience-qa/`, including `functional-results.json`, `viewport-results.json` and `reveal-results.json`. External URLs/attributes were checked against the supplied source and generated HTML; remote products were not exercised. The Playwright contexts and task preview server were closed after QA. No deployment was performed.

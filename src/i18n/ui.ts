export type Locale = 'en' | 'pl';
export const localeOf = (value: string | undefined): Locale => value === 'pl' ? 'pl' : 'en';

const en = {
  about: 'About', work: 'Work', contact: 'Contact', stack: 'Stack', experience: 'Experience',
  homepage: 'Homepage', allProjects: 'All projects', independentWork: 'Independent work',
  skip: 'Skip to content', mainNavigation: 'Main navigation', footerNavigation: 'Footer navigation',
  backTop: 'Back to top', home: 'home', language: 'Language',
  heroTitle: 'Full-stack developer building web applications and AI tools.',
  pause: 'Pause headline animation', resume: 'Resume headline animation', scroll: 'Scroll to explore',
  toolsTitle: 'Tools I build with.', toolsLabel: 'Technologies and tools',
  workedWith: 'Worked with.', professionalExperience: 'Professional experience', partTime: 'Part-time',
  contribution: 'My contribution', readCase: 'Read case study', visitWebsite: 'Visit website',
  readProject: (name: string) => `Read ${name} case study`,
  visitProject: (name: string) => `Visit ${name} website (opens in a new tab)`,
  newTab: ' (opens in a new tab)', caseStudy: 'Case study', visitLive: 'Visit live website',
  exploreProject: 'Explore the project', technologies: 'Selected technologies',
  backWork: 'Back to independent work', visit: 'Visit', backExperience: 'Back to experience',
  role: 'The role', acrossRole: 'Across the role', reference: 'Public reference', references: 'Public references',
  contactIntro: 'Have something in mind?', footerLines: ['Let’s build', 'something useful.'],
  explore: 'Explore', sayHello: 'Say hello', services: ['Full-stack development.', 'AI integrations & developer tools.'],
};

export const ui: Record<Locale, typeof en> = {
  en,
  pl: {
    about: 'O mnie', work: 'Realizacje', contact: 'Kontakt', stack: 'Technologie', experience: 'Doświadczenie',
    homepage: 'Strona główna', allProjects: 'Wszystkie realizacje', independentWork: 'Projekty własne',
    skip: 'Przejdź do treści', mainNavigation: 'Nawigacja główna', footerNavigation: 'Nawigacja w stopce',
    backTop: 'Wróć na górę', home: 'strona główna', language: 'Język',
    heroTitle: 'Full-stack developer. Tworzę aplikacje internetowe i narzędzia AI.',
    pause: 'Zatrzymaj animację nagłówka', resume: 'Wznów animację nagłówka', scroll: 'Poznaj mnie',
    toolsTitle: 'Z czym pracuję.', toolsLabel: 'Technologie i narzędzia',
    workedWith: 'Doświadczenie', professionalExperience: 'Doświadczenie zawodowe', partTime: 'Niepełny wymiar czasu pracy',
    contribution: 'Mój wkład', readCase: 'Zobacz projekt', visitWebsite: 'Odwiedź stronę',
    readProject: (name) => `Poznaj projekt ${name}`,
    visitProject: (name) => `Odwiedź stronę ${name} (otwiera się w nowej karcie)`,
    newTab: ' (otwiera się w nowej karcie)', caseStudy: 'Opis realizacji', visitLive: 'Odwiedź stronę',
    exploreProject: 'Poznaj szczegóły', technologies: 'Wybrane technologie',
    backWork: 'Wróć do projektów własnych', visit: 'Odwiedź stronę', backExperience: 'Wróć do doświadczenia',
    role: 'Moja rola', acrossRole: 'Wykorzystywane na tym stanowisku', reference: 'Link do projektu', references: 'Linki do projektu',
    contactIntro: 'Masz pomysł na projekt?', footerLines: ['Stwórzmy coś', 'przydatnego.'],
    explore: 'Na stronie', sayHello: 'Napisz do mnie', services: ['Tworzenie aplikacji od A do Z.', 'Integracje z AI i narzędzia dla programistów.'],
  },
};

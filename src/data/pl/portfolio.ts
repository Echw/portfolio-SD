import { profile as englishProfile, projects as englishProjects, type Project, type HeroHeadline } from '../portfolio';

export const profile = {
  ...englishProfile,
  heroDescription: 'Senior full-stack developer. Tworzę aplikacje i rozwiązania z AI.',
  description: 'Damian Stojaniuk — senior full-stack developer. Tworzę aplikacje internetowe, integracje z AI i narzędzia dla programistów w TypeScript, React i Node.js.',
  about: {
    start: 'Tworzę aplikacje od interfejsu po API i integracje. Ostatnio skupiam się na',
    highlight: 'funkcjach opartych na AI',
    end: 'i narzędziach dla programistów.',
    personal: 'Poza pracą: gitara, własne efekty gitarowe i mikrokontrolery.',
  },
};

export const heroHeadlines: HeroHeadline[] = [
  { lines: ['Full-Stack', 'Developer'] },
  { lines: ['Aplikacje webowe.', 'Narzędzia AI.'] },
];

type ProjectCopy = Pick<Project, 'description' | 'contributions' | 'imageAlt'>;
export const projectCopy: Record<string, ProjectCopy> = {
  goldnat: {
    description: 'Zbudowałem stronę Goldnat i dostosowałem Payload CMS do pracy zespołu sprzedaży. Dodałem dobór samochodów dla konkretnych klientów i formularze udostępniane przez prywatne linki.',
    contributions: ['Tworzenie aplikacji full-stack', 'Dostosowanie Payload CMS', 'Narzędzia sprzedażowe', 'Wdrożenie'],
    imageAlt: 'Czarny samochód przed oświetlonym betonowym budynkiem nocą. Zdjęcie ze strony Goldnat.',
  },
  'mlyn-nad-sanna': {
    description: 'Na podstawie dostarczonego projektu graficznego stworzyłem responsywną stronę z Sanity CMS do zarządzania pokojami i treścią. Zająłem się też integracjami, wdrożeniem i przekazaniem strony klientowi.',
    contributions: ['Wdrożenie projektu graficznego', 'Sanity CMS', 'Integracje', 'Uruchomienie i przekazanie strony'],
    imageAlt: 'Jesienne drzewa odbijające się w rzece Sannie. Zdjęcie ze strony Młyna nad Sanną.',
  },
};

export const projects: Project[] = englishProjects.map((project) => {
  const copy = projectCopy[project.id];
  if (!copy) throw new Error(`Missing Polish project copy: ${project.id}`);
  return { ...project, ...copy };
});

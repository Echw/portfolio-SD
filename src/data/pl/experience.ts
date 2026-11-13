import { experience as englishExperience, type Experience, type ExperienceProject } from '../experience';

type ProjectCopy = Pick<ExperienceProject, 'title' | 'context' | 'paragraphs'> & { referenceLabels: string[] };
type ExperienceCopy = Pick<Experience, 'period' | 'description' | 'overview' | 'summary' | 'arrangement' | 'contributions'> & {
  projects?: Record<string, ProjectCopy>;
};

export const experienceCopy: Record<string, ExperienceCopy> = {
  flyps: {
    period: 'lis 2025–obecnie',
    summary: 'Funkcje oparte na AI i narzędzia dla programistów.',
    description: 'Moja praca we Flyps: rozwój aplikacji SaaS, integracje asystentów AI, narzędzia dla programistów, uwierzytelnianie i testy end-to-end.',
    overview: 'Rozwijam aplikacje SaaS — od interfejsów po API i integracje. Ostatnio skupiam się na asystentach AI i narzędziach dla programistów. Łączę asystentów z zewnętrznymi usługami, zajmuję się obsługą dostępu i sesji oraz rozwiązaniami, które pozwalają użytkownikom kontrolować działania AI.',
    contributions: [
      'Tworzę integracje przez API i MCP, łączące asystentów AI z danymi aplikacji i zewnętrznymi usługami.',
      'Rozwijam i utrzymuję rozszerzenia do edytorów i przeglądarek oraz wtyczki CLI. Zajmuję się też ich instalacją, aktualizacjami i automatyzacją wydań.',
      'Pracuję nad uwierzytelnianiem, kontrolą dostępu i obsługą sesji, w tym nad zatwierdzaniem działań AI przez użytkownika.',
      'Rozwijam wyszukiwanie dokumentów i oceniam poprawność oraz kompletność wyników generowanych przez AI.',
      'Rozbudowuję testy end-to-end najważniejszych ścieżek użytkownika i kontrole w CI, które pomagają wychwytywać regresje przed wydaniem.',
    ],
  },
  thebrain: {
    period: 'maj 2025–paź 2025',
    summary: 'Interaktywna nauka ze wsparciem AI.',
    description: 'Moja praca w TheBrain Software House: aplikacje do czytania i nauki, interfejsy, API oraz pomoc AI oparta na treści książek i etapach lekcji.',
    overview: 'Pracowałem nad aplikacjami do czytania i nauki. Rozwijałem interfejsy, API i funkcje AI, które korzystały z treści aktualnie czytanej książki lub przerabianej lekcji.',
    contributions: [
      'Rozwijałem interaktywny czytnik książek i jego API, w tym funkcję zadawania AI pytań o treść książki.',
      'Tworzyłem interaktywne lekcje matematyki z asystentem AI, który odpowiadał na pytania w kontekście aktualnego etapu lekcji.',
      'Łączyłem interfejsy z backendem, tak aby odpowiedzi modeli AI były częścią interaktywnej nauki.',
    ],
  },
  xolvio: {
    period: 'lip 2021–kwi 2025',
    summary: 'Strony 2K i narzędzia łączące przeglądarkę ze sprzętem.',
    description: 'Mój wkład w projekty Xolv.io dla 2K i Hatch Lighting: narzędzia publikacyjne, wspólne komponenty i Foundation Programming Portal do programowania urządzeń z przeglądarki.',
    overview: 'Pracowałem nad narzędziami do publikowania stron 2K oraz platformą do programowania układów elektronicznych w przeglądarce. Zajmowałem się wspólnymi komponentami interfejsu, usługami backendowymi, bezpośrednią współpracą z klientami, wsparciem wdrożeń i przekazywaniem projektów.',
    contributions: [
      'Zbudowałem usługę łączącą dane graczy 2K z Zendesk, wykorzystywaną do oznaczania zgłoszeń i kierowania ich do odpowiednich zespołów.',
      'Współpracowałem bezpośrednio z klientami przy ustalaniu wymagań, omawianiu rozwiązań, prezentacjach, wdrożeniach i pilnych poprawkach.',
    ],
    projects: {
      '2k': {
        title: '2K: narzędzia do publikowania stron gier',
        context: 'Projekt zespołowy w Xolv.io',
        paragraphs: [
          'Jako członek głównego zespołu pracującego dla 2K współtworzyłem ponad 80 wspólnych komponentów i warstwę wizualną ponad 15 stron gier, m.in. NBA 2K, Borderlands i Civilization.',
          'Zbudowałem panel administracyjny i rozbudowałem jego backend, aby zespół marketingu mógł zarządzać treścią, cofać zmiany i planować publikację stron. Dodałem też do CI testy regresji wizualnej, które wykrywały niezamierzone zmiany na stronach gier przed publikacją.',
        ],
        referenceLabels: ['Opis współpracy Xolv.io z 2K'],
      },
      'hatch-lighting': {
        title: 'Hatch Lighting: Foundation Programming Portal',
        context: 'Projekt dla klienta Xolv.io',
        paragraphs: [
          'Prowadziłem rozwój Foundation Programming Portal dla Hatch Lighting — od pierwszej koncepcji po przekazanie projektu. Portal pozwala programować i konfigurować zasilacze LED z serii Foundation bezpośrednio w przeglądarce, łącząc aplikację ze sprzętem przez Web Serial i WebUSB.',
          'Użytkownicy mogą ustawiać prąd wyjściowy i parametry ściemniania, zapisywać profile oraz historię sesji programowania. Połączyłem interfejs aplikacji, komunikację ze sprzętem i infrastrukturę chmurową w narzędzie dostosowane do procesu programowania urządzeń u producenta.',
        ],
        referenceLabels: ['Foundation Programming Portal', 'Seria Foundation firmy Hatch Lighting'],
      },
    },
  },
  leaderna: {
    period: 'paź 2022–maj 2023',
    arrangement: 'W niepełnym wymiarze czasu pracy, równolegle z pracą w Xolv.io',
    description: 'Moja praca nad Leaderna Platform w niepełnym wymiarze: rozwój aplikacji, wizualizacje zależności zadań badawczych i interaktywna oś czasu dla branży farmaceutycznej i biotechnologicznej.',
    overview: 'Współtworzyłem znaczną część Leaderna Platform — aplikacji do zarządzania projektami badawczo-rozwojowymi i ich portfelami dla zespołów farmaceutycznych i biotechnologicznych. Oprócz rozwoju funkcji aplikacji zajmowałem się interaktywnymi widokami planów badań, zależności między zadaniami i harmonogramów.',
    contributions: [
      'Tworzyłem wizualizacje zależności między zadaniami w React i D3.js.',
      'Współprojektowałem i wdrażałem oś czasu z obsługą przeciągania i upuszczania jako alternatywę dla klasycznego wykresu Gantta.',
      'Jako członek zespołu produktowego rozwijałem funkcje i wprowadzałem poprawki w aplikacji opartej na TypeScript i GraphQL.',
    ],
    projects: {
      'visual-planning': {
        title: 'Leaderna: wizualne planowanie badań',
        context: 'Projekt zespołowy w Leaderna Platform',
        paragraphs: ['Przekładaliśmy złożone plany badań na interaktywny interfejs. W zespole produktowym pracowałem zarówno nad widokami do planowania, jak i pozostałymi funkcjami aplikacji.'],
        referenceLabels: ['Leaderna Platform'],
      },
    },
  },
  eleader: {
    period: 'sty 2020–maj 2021',
    description: 'Moja praca w eLeader: rozwój aplikacji dla przedstawicieli handlowych oraz współpraca z marketingiem i projektantami nad stroną firmową.',
    overview: 'Rozwijałem i utrzymywałem aplikację wspierającą pracę przedstawicieli handlowych w terenie. Wspólnie z zespołem marketingu i projektantami pracowałem też nad główną stroną firmy.',
  },
  plum: {
    period: 'lip 2018–cze 2019',
    description: 'Moja praca w PLUM: programowanie mikrokontrolerów STM32 i samodzielnie zbudowana aplikacja C# WPF do testowania urządzeń grzewczych i wentylacyjnych.',
    overview: 'Zaczynałem od systemów wbudowanych: programowania mikrokontrolerów STM32 i testowania funkcji urządzeń. Później samodzielnie stworzyłem aplikację C# WPF do testowania urządzeń grzewczych i wentylacyjnych — od koncepcji po wdrożenie.',
    contributions: [
      'Rozwijałem moduły sterowników i wyświetlaczy do urządzeń grzewczych.',
      'Programowałem mikrokontrolery i ich peryferia, testowałem nowe funkcje i pisałem dokumentację dla programistów.',
      'Zbudowałem aplikację desktopową wspierającą testowanie urządzeń.',
    ],
  },
};

export const experience: Experience[] = englishExperience.map((entry) => {
  const copy = experienceCopy[entry.id];
  if (!copy) throw new Error(`Missing Polish experience copy: ${entry.id}`);
  return {
    ...entry, ...copy,
    projects: entry.projects?.map((project) => {
      const translated = copy.projects?.[project.id];
      if (!translated || translated.referenceLabels.length !== project.references.length) {
        throw new Error(`Incomplete Polish experience project: ${project.id}`);
      }
      const { referenceLabels, ...text } = translated;
      return { ...project, ...text, references: project.references.map((reference, index) => ({ ...reference, label: referenceLabels[index] })) };
    }),
  };
});

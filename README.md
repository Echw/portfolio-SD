# Damian Stojaniuk — portfolio

Lokalne, statyczne portfolio w Astro + TypeScript. Własne komponenty, zwykły CSS,
lokalne fonty Archivo / Inter, GSAP / ScrollTrigger oraz Lenis. Projekt nie został opublikowany.

## Goldnat i Młyn nad Sanną — case studies

Podstrony: `/work/goldnat/` i `/work/mlyn-nad-sanna/`. Obie karty otwierają case study,
a odnośniki do publicznych realizacji są na podstronach.
Treść i podpisy są w `src/data/case-studies.ts`, oryginalne screeny w `src/assets/goldnat/`.
Wspólny komponent `src/components/CaseStudy.astro` renderuje model `CaseStudy`,
a `CaseStudyFigure.astro` odpowiada za ilustracje. Opcjonalne `coverPosition` ustawia
kadr fotografii (Sanna: `center 55%`, domyślny Goldnat: `center 75%`), a `titleLines`
pozwala ustalić podział długiego tytułu. Cover ma proporcje 2:1 na desktopie i 4:3 na mobile.
Sanna zachowuje cztery angielskie rozdziały z `portfolio.md`, przypisuje projekt graficzny
grafikowi i opisuje Sanity jako CMS. Screeny homepage, apartamentu i edytora Sanity
są w `src/assets/sanna/`; ich pochodzenie i wyniki kontroli są w `QA-sanna.md`.
Layout współdzieli header, kontakt, tło i kursor ze stroną główną. Screeny zachowują
proporcje i podpisy, bez linków do powiększania. Zdjęcie otwierające pozostaje dotychczasowe.

Przejście stron to jeden jednolity panel w kolorze tła (`--bg`), bez strun w środku,
z prostym obrysem 1 px. Rozciąga się od lewej przez 550 ms, zakrywa ekran przez 600 ms,
a następnie zsuwa w prawo przez 550 ms. Widoki zmieniają się wyłącznie pod pełnym zakryciem.
Przesłona HTML jest animowana przez GSAP z CustomEase; nie wymaga natywnych View Transitions.
Astro ClientRouter (`fallback="swap"`) pobiera stronę równolegle z zamykaniem panelu,
a `transition:persist` zachowuje przesłonę podczas wymiany dokumentu. Domyślne animacje
routera są wyłączone. Panel jest niewidoczny w spoczynku i zwinięty przed pokazaniem.
Łącznie około 1700 ms, z płynnym przyspieszeniem i hamowaniem; wolna sieć wydłuża zakrycie.
Pod pełnym zakryciem pojawia się nazwa strony docelowej: 150 ms wejścia, 300 ms pauzy,
150 ms wygaszenia. Osobna warstwa napisu zapobiega jego rozciąganiu. Layout przyjmuje
`transitionLabel` (Goldnat lub Młyn nad Sanną; domyślnie Homepage). Powrót na stronę główną dobiera napis
do celu: All projects dla #work, nazwa sekcji dla About/Stack/Experience/Contact,
Homepage dla #top i bez kotwicy. Napis jest odczytywany z metadanych nowej strony i docelowego URL.
Nie ma kopii canvas, wygiętych masek ani przenikania treści. Historią zarządza router Astro.
Style przejścia są osadzone w head przed pierwszą klatką, również w dev; plik CSS ma UTF-8 bez BOM.
Tło rysuje się przed oczekiwaniem na fonty; po opuszczeniu strony zachowuje ostatnią klatkę.
Powrót przez przejście pomija intro hero i wejście kart; zmiana rozmiaru skraca animację.
Przed wymianą strony sprzątane są GSAP, Lenis i listenery; po niej uruchamiają się ponownie.
Wstecz/Dalej zachowuje pozycję scrolla, a lokalne kotwice nie nadpisują stanu historii.
Scroll do kotwicy kończy się po 900 ms i zapisuje pozycję z zachowaniem indeksu Astro;
Wstecz/Dalej przerywa poprzedni ruch Lenis, aby nie nadpisał przywróconej pozycji.
Syntetyczny `popstate` Astro podczas kliknięcia kotwicy w WebKit nie przerywa tego kliknięcia;
po ustawieniu adresu pozycja Lenisa jest synchronizowana z ekranem. Najnowsze kliknięcie
zastępuje poprzedni cel. Mijane podczas nawigacji karty odsłaniają się bez blokowania
scrolla; ich pełna animacja z zatrzymaniem pozostaje przy ręcznym przewijaniu.
Ograniczenie ruchu pomija animację. Błąd pobierania lub limit 10 sekund uruchamia zwykłą nawigację.
Bez JavaScript działają standardowe linki. Weryfikacja wizualna silników jest opisana w QA-goldnat.md.
Na podstronie nie uruchamiają się intro hero ani animacje wejścia kart strony głównej.

Publiczny katalog opisany jest jako działający; prywatne oferty i formularze jako
wdrożony prototyp do prób pracowniczych. Nie używamy interfejsów z wygenerowanych makiet.

## Doświadczenie zawodowe

Sześć tekstowych podstron `/experience/{id}/` powstaje z jednego modelu
`src/data/experience.ts` i komponentu `ExperienceDetail.astro`. Identyfikatory:
`flyps`, `thebrain`, `xolvio`, `leaderna`, `eleader`, `plum`. Homepage korzysta
z tych samych nazw, stanowisk, dat i kolejności. Wiersze są zwykłymi linkami.
Opisy 2K i Hatch są sekcjami Xolv.io, a visual planning — sekcją Leaderna.
Technologie dotyczą całej roli. Model nie wymaga zdjęć ani adresu realizacji.
Podstrony współdzielą PortfolioLayout, prymitywy case study i istniejące przejścia.
Wyniki weryfikacji i ograniczenia: `QA-experience.md`.

## Uruchamianie

Wymagany Node.js >= 22.23.4. W Windows PowerShell używaj npm.cmd:

    cd "C:\Users\Ewa-komp\Desktop\Nowy folder\portfolio"
    npm.cmd ci
    npm.cmd run dev

Otwórz adres Local wypisany przez Astro, zwykle http://127.0.0.1:4321.
Jeśli port jest zajęty, Astro wypisze kolejny dostępny adres.
Serwer dev odświeża stronę po zmianach. Zatrzymasz go przez Ctrl+C.

Jeśli instalacja zgłosi UNABLE_TO_VERIFY_LEAF_SIGNATURE, użyj zaufanych certyfikatów
systemowych w tej samej sesji PowerShell (bez wyłączania TLS):

    $env:NODE_OPTIONS = (($env:NODE_OPTIONS + ' --use-system-ca').Trim())
    npm.cmd ci

## Kontrole i produkcyjny podgląd

    npm.cmd run check
    npm.cmd run build
    npm.cmd test
    npm.cmd run test:projects
    npm.cmd run preview

Build zapisuje statyczną stronę w dist/. Testy dokumentu wymagają wcześniejszego builda.
Test test:projects tymczasowo dopisuje trzeci projekt, sprawdza prawdziwy build, a następnie
przywraca pierwotny plik danych i produkcyjny build z dwoma projektami. Uruchamiaj go
osobno od zwykłych testów; podczas tego testu nie edytuj pliku danych.
Preview pokazuje gotowy build; po zmianach kodu trzeba zbudować go ponownie.
Nie otwieraj dist/index.html przez file:// — użyj serwera.

## Edycja treści

Treści homepage: **src/data/portfolio.ts**; doświadczenie: **src/data/experience.ts**;
case studies: **src/data/case-studies.ts**.

- profile — nazwisko, kontakt, opis i akapit About;
- heroHeadlines — warianty hero, zawsze po dwa wiersze;
- projects — projekty własne, ich kolejność, opisy, zdjęcia i zakres pracy;
- stack — lista technologii.

### Nowy projekt

Dodaj zdjęcie do src/assets/, zaimportuj je w pliku danych, a potem dopisz rekord do projects:

    import newImage from '../assets/new-project.webp';

    {
      id: 'unique-project-id',
      name: 'Project name',
      description: 'A short factual description of the work.',
      contributions: ['Website development', 'Other contribution'],
      image: newImage,
      imageAlt: 'Describe what the image shows.',
      imagePosition: 'center 50%',
      url: 'https://example.com/',
    },

Unikalne id jest używane w nagłówku i powiązaniu dostępności. Siatka oraz licznik automatycznie
uwzględniają nowe rekordy. imagePosition ustawia kadr; Goldnat używa center 75%, dopasowanego
do ramy 2:1 i położenia samochodu w pionowym oryginale. Młyn zachowuje center 55%.
Zdjęcia nie przedstawiają prywatnych paneli ani CRM.

## Ruch i zachowanie

- Tło: jeden dekoracyjny Canvas 2D, przyklejony do viewportu poza main. Treść przewija się
  na osobnej warstwie powyżej. Cienkie grafitowe linie są przygaszone w centrum pola czytania.
  Mysz odgina je lokalnie do 24 px w promieniu 180 px i dodaje pomarańczowy akcent
  z miękką poświatą 8 px wyłącznie na aktywnych liniach. Glow wygasa razem z reakcją.
  Po zatrzymaniu wskaźnika sprężyna wraca do zera i odłącza własny callback z tickera GSAP.
  Scroll i kotwice nie przesuwają wzoru. Brak osobnej pętli requestAnimationFrame.
  Limit DPR 1,5, 18–36 linii i maksymalnie 32 punkty na linię. Dotyk ma 12 statycznych linii;
  reduced motion także pozostaje statyczny. Bez JS lub kontekstu 2D tło jest jednolite.
- Wejście: kurtyna odsłania stronę w 850 ms, a nawigacja i opis dołączają pod koniec.
  Działa raz przy pełnym załadowaniu na górze strony; kotwice i powrót z historii ją pomijają.
  Interakcja kończy ją natychmiast. Zabezpieczenie usuwa kurtynę po 3 s przy opóźnieniu skryptów.
- Hero: rzeczywiste wpisywanie 70 ms/znak, najpierw pierwszy, potem drugi wiersz (przerwa 180 ms).
  Pełny tekst pozostaje przez 3,5 s, następnie jest kasowany od końca w tempie 50 ms/znak.
  Po 250 ms pustego nagłówka rozpoczyna się drugi wariant. Jeden kursor podąża za tekstem.
  Niewidoczne pełne wiersze rezerwują miejsce, bez zmian wymiarów layoutu.
- Pauza hero: przycisk, wyjście z ekranu i ukrycie karty to niezależne blokady. Zamknięcie
  jednej blokady nie uruchamia animacji, jeśli inna pozostaje aktywna.
- Mała ikona przewijania prowadzi do projektów; jej animacja ma ograniczoną liczbę powtórzeń.
- Lenis: lerp 0.1, jeden ticker GSAP, wygładzone kółko, natywny dotyk. Kotwice używają Lenisa,
  a klawiatura przełącza do celu natychmiastowo. Tab i klawisze nawigacji przerywają bezwładność.
- Projekty: najpierw wjazd spod dolnej krawędzi viewportu (650 ms), następnie obrót 180° → 0°
  (1,1 s). Odstęp między kolumnami wynosi 160 ms; obrót zaczyna się po przyjeździe obu kart.
  Start: górna krawędź kafla dochodzi do 50% wysokości ekranu. Rewers jest pusty i ciemny;
  po obrocie widoczna jest cała realizacja.
  Każdy następny wiersz uruchamia własne wejście. Bez przypinania i scrubowania.
- Kompozycja kart: numer i nazwa → zdjęcie → opis → My contribution → pojedyncze Visit website.
  Nagłówek ma 32–40 px, opis 22–24 px na dużym ekranie, a zakres pracy jest osobną grupą.
- Desktop od 1024×720: sekcja dostaje określoną wysokość viewportu pod nawigacją; karty
  rozciągają się do pozostałej części sceny. Naturalne wysokości tekstu są mierzone osobno
  od elastycznej przestrzeni opisu. Przy zbyt dużej treści wraca naturalny układ bez obcięcia.
- Zdjęcia: wspólna rama 2:1, docelowo 37% wysokości karty. Mniejsza wysokość oznacza też
  proporcjonalnie mniejszą szerokość; zdjęcie jest wycentrowane i otoczone marginesami.
  Brak limitu 200 px. Poniżej 900 px rama ma proporcje 3:2, a karty naturalną wysokość.
- Scroll na czas wejścia: Lenis zatrzymuje wejście użytkownika, a scena ustawia się pod
  nawigacją. Odblokowanie następuje po obrocie obu kart. Tab, Escape, kotwice, zmiana rozmiaru,
  ukrycie karty i błąd kończą animację; watchdog po 3,5 s zapobiega trwałej blokadzie.
  Na telefonie i przy kolejnych projektach kadrowana jest aktywna karta, a nie początek sekcji.
- Nieruchomy link obsługuje kursor, osobna warstwa realizuje pochylenie do 3° i światło,
  a kolejne warstwy odpowiadają za wjazd i obrót. Hover działa dopiero po odsłonięciu karty.
  Szybkie wyjście, scroll pod nieruchomą myszką, anulowanie wskaźnika i utrata widoczności
  wygaszają efekt. Zdjęcie na hover przybliża do 1.035.
- Dotyk: bez pochylenia i śledzenia kursora. Klawiatura natychmiast odsłania skupiony kafel
  i pokazuje statyczne rozświetlenie. Reduced motion i brak JS pokazują od razu oba fronty.
- Worked with: wejście 48 px / 1,1 s / odstęp 100 ms; nazwa i linia reagują na hover.
- About: przewijanie rozjaśnia słowa i usuwa lekkie rozmycie. Przygaszony tekst pozostaje czytelny.
- Stack: 18 informacyjnych kafelków o wysokości 120 px, w siatce 6 kolumn od 1200 px,
  4 kolumn od 768 px i 2 poniżej. Promień 14 px, wspólna poświata z Work, bez pochylenia.
  Blok max-width 1240 px i niepełne rzędy są wycentrowane; flex-wrap zachowuje szerokości
  6/4/2 kolumn. Ikona 28 px i nazwa z odstępem 10 px są centrowane jako jedna grupa;
  naturalna wysokość nazwy zapewnia równe odstępy nad ikoną i pod tekstem.
  Nie są linkami ani przyciskami i nie trafiają do kolejności tabulacji.
  Ikony są lokalnymi inline SVG w bieli #fff i płynnie przechodzą w pomarańcz na hover. Nie dodają żądań
  do CDN ani klientowego pakietu ikon. Przy dodaniu narzędzia uzupełnij też typowaną mapę
  src/data/stack-icons.ts; brak ikony jest wykrywany podczas sprawdzania TypeScriptu.
- Własny kursor przy myszy i normal motion: dokładny punkt 4 px oraz okrąg 30 px
  podążający przez 180 ms. Linki/przyciski: pomarańcz i 42 px; Stack: pomarańcz i 30 px.
  Kliknięcie zwęża okrąg. Natywny wskaźnik znika dopiero po udanym ustawieniu obu elementów.
  Klawiatura, dotyk, opuszczenie okna, ukrycie karty i błędy przywracają natywny wskaźnik.
- Zaznaczanie jest wyłączone na nagłówkach, nawigacji i etykietach interfejsu. Opisy projektów,
  About i e-mail nadal mają user-select: text. Opis wewnątrz poruszającej się karty ma własny
  hit-test dla zaznaczania; linki projektów i obrazy mają draggable=false.
- Footer: duży dwuwierszowy tekst, nawigacja, mailto i powrót do góry. Bez formularza i backendu.
- Reduced motion: pierwszy nagłówek statyczny, brak Lenisa, pochylenia, rozmywania i przesuwania.
- Bez JavaScriptu: wszystkie treści i linki dostępne; wizualnie widoczny pierwszy nagłówek.
- Moduły sprzątają ticker, obserwatory, timery, listenery i animacje przy zmianie preferencji,
  przeładowaniu modułów i opuszczeniu strony. Powrót z pamięci przeglądarki zachowuje pozycję.

Kod animacji jest rozdzielony na motion.ts (koordynacja), hero.ts i typewriter-controller.ts,
entry-bootstrap.js (pierwsza klatka i zabezpieczenie kurtyny), project-entry.ts / project-layout.ts
(wjazd i geometria sceny/zdjęć), cards.ts / card-pointer.ts / card-light.ts (wspólna poświata),
cursor.ts (własny wskaźnik myszy),
scroll.ts / scroll-hold.ts (wygładzanie i czasowe zatrzymanie przewijania).
backdrop.ts / backdrop-field.ts odpowiadają za canvas i model reakcji tła w układzie viewportu.
Nie trzeba zmieniać go przy dodawaniu projektu.

## Materiały i inspiracje

Zdjęcia pochodzą z publicznych witryn:

- https://goldnat.pl/brand/hero-portrait-city-balanced.webp
- https://mlynnadsanna.pl/images/ui/hero-bg.webp

Wkład Damiana i funkcje paneli opisano na podstawie informacji użytkowniczki.
Doświadczenie pochodzi z dostarczonego CV; 2K przypisano do Xolv.io.

Referencje: Edwin Le (hero), Bouayaben (lista realizacji), Majd (obrót kart, tekst i stopka),
Ruben Marcus (Stack). Motyw świetlnych kafelków nawiązuje do opisu CodePena
https://codepen.io/echw/pen/RwqrwJX — demo blokowało odczyt błędem 403,
więc implementacja nie jest deklarowana jako kopia 1:1.
Reakcja linii w tle jest własną interpretacją efektu z https://monument.tv/.

Obrazy AVIF/WebP i srcset są generowane przez Astro. Fonty są lokalne.
Ikony Stack: Devicon (14), Lobe Icons (MCP, OpenAI, Anthropic) oraz Lucide Database (RAG).
Lokalne pliki i pełne licencje: src/assets/stack/. sources.json zapisuje źródła przypięte
do commitów i zakres adaptacji (currentColor, atrybuty dostępności, bez zmian geometrii).
Strona ma SEO, favicon, Open Graph i JSON-LD Person. Przed publikacją ustaw docelowe
site w astro.config.mjs oraz bezwzględny og:image i canonical. public/og.png to tylko
obraz udostępniania; layout strony jest rzeczywistym HTML/CSS.

## Weryfikacja

Wyniki i ograniczenia: [QA.md](QA.md).

Automatyczne testy obejmują prefiksy tekstu, pisanie/kasowanie, kursor, pauzy z zachowaniem
pozostałego czasu, czyszczenie timerów, warunki revealu i jego zabezpieczenie, limity pochylenia,
przerwanie efektów kursora, sterownik wjazdu/fokusu, ramę 2:1 i budżet wysokości sceny,
rzeczywisty kontroler blokady oraz adapter scrolla z atrapą Lenisa (bez silnika przeglądarki),
statyczny dokument, kontakty, kotwice, Stack, metadane i pliki zasobów.
Osobny test integracyjny buduje siatkę z trzecim projektem i odtwarza stan wyjściowy.

Przeglądarka — scenariusze do faktycznego sprawdzenia:

- 360, 390, 768, 1024, 1440 i 1536 px; zoom 200%; brak poziomego przepełnienia;
- nieruchoma geometria tła podczas przewijania / kotwic / blokady kart; lokalna reakcja
  i uspokojenie po zatrzymaniu myszy; czytelność hero, opisów i stopki; statyczny dotyk/reduced motion;
- reveal po przeładowaniu na górze, przerwanie interakcją, pominięcie na #work i po Wstecz;
- pełny cykl pisania/kasowania i pauza, przewinięcie hero poza ekran, ukrycie karty i powrót;
- karty: wjazd/obrót i odstęp 160 ms; równy rozmiar zdjęć oraz cała sekcja pod nawigacją
  przy 1024×720, 1440×900 i 1536×1024; bez przycinania przy zoomie 200%;
- czytelny kadr samochodu / krajobrazu, rozkład przestrzeni tekstu, blokada do zakończenia
  obu obrotów i zwolnienie po przerwaniu; druga karta na telefonie nie cofa do początku sekcji;
- światło i pochylenie, szybkie przekraczanie krawędzi, scroll pod nieruchomym kursorem,
  przechodzenie między kaflami, fokus Tab podczas wejścia i obsługa dotykiem;
- Stack 6/4/2, środek bloku i ostatniego rzędu, ikony na jednej wysokości, długie nazwy
  w dwóch liniach, poświata na krawędziach; własny punkt i okrąg, kolor/rozmiar
  hover, kliknięcie, powrót po opuszczeniu okna, ukryciu karty i nawigacji klawiaturą;
- kopiowanie opisów, About oraz e-maila, brak przypadkowego zaznaczania etykiet i ghost-drag obrazów;
- Lenis, kotwice, przerwanie przewijania klawiaturą i bezpośrednie wejście na #contact;
- About, Stack i footer: płynność, czytelność, kadry i kolejność efektów;
- przełączenie reduced motion podczas oglądania, bez JS i z uszkodzonym zdjęciem;
- przycisk Wstecz / Dalej i zachowanie pozycji po powrocie do strony.


## Wersje językowe

Astro generuje 18 statycznych stron: 9 angielskich pod dotychczasowymi adresami
i 9 polskich pod `/pl/`. Konfiguracja i18n pozostawia `en` jako język domyślny
bez prefiksu. Przełącznik PL / EN w nagłówku prowadzi do odpowiednika aktualnej
strony; z JavaScript zachowuje także kotwicę. Język wynika z adresu URL,
bez automatycznych przekierowań, ciasteczek i zapisywania preferencji.

Szablony i komponenty są wspólne. `src/i18n/ui.ts` zawiera typowany słownik
interfejsu, `src/i18n/content.ts` wybiera treści według `Astro.currentLocale`,
a `src/i18n/routes.ts` tworzy adresy przez `astro:i18n`.
Polskie opisy znajdują się w `src/data/pl/`. Dane strukturalne, identyfikatory,
nazwy firm i technologii, obrazy oraz adresy zewnętrzne są współdzielone z EN.
Nowy projekt wymaga także wpisu w polskim `projectCopy`; brak tłumaczenia
zatrzymuje build. Analogicznie należy uzupełniać opisy doświadczenia i realizacji.
Testy sprawdzają kompletność tłumaczeń i zgodność ich struktury.

Animowany nagłówek odczytuje tekst i etykiety przycisku z aktualnego HTML.
Przejścia pobierają etykiety sekcji ze strony docelowej, również przy zmianie języka.
Pełne słowniki i opisy pozostają po stronie generowania statycznego HTML.

Po ustawieniu produkcyjnego `site` w `astro.config.mjs` layout generuje canonical,
wzajemne `hreflang=en/pl`, `x-default` dla EN oraz bezwzględne adresy Open Graph.
Bez domeny nie emituje fikcyjnych adresów canonical/hreflang.

`npm.cmd test` obejmuje oba języki. `npm.cmd run test:projects` tymczasowo dodaje
trzeci projekt i jego polskie tłumaczenie, sprawdza obie strony główne, a następnie
odtwarza oba pliki i standardowy build. Podczas tego testu nie edytuj tych plików.

Dwa przeglądy językowe i wyniki kontroli: [QA-i18n.md](QA-i18n.md).

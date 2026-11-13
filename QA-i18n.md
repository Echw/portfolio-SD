# Wersje językowe — kontrola jakości

Data: 13 listopada 2026.

## Zakres i kryteria odbioru

9 stron EN i 9 odpowiedników PL: strona główna, Goldnat, Młyn nad Sanną
oraz Flyps, TheBrain, Xolv.io, Leaderna, eLeader i PLUM.
Wspólne szablony, język ustalany z URL, PL pod `/pl/`, EN bez prefiksu.

Kontrola obejmuje treść, metadane, opisy zdjęć, etykiety dostępności,
przełącznik języka, kotwice, powroty z podstron, historię przeglądarki,
animowany nagłówek i jego pauzę, przejścia, układ mobilny i desktopowy.
Scenariusze dodatkowe: zmiana języka po zatrzymaniu nagłówka, przełączanie
na podstronie z zachowaniem historii, brak JavaScript i ograniczenie ruchu.

## Przegląd językowy 1 — zgodność z EN

Porównano polskie treści z trzema źródłowymi modelami danych oraz tekstami
komponentów. Sprawdzono wszystkie akapity, listy, podpisy, opisy alternatywne,
daty, nazwy stanowisk i metadane.

- Zachowane firmy, technologie, daty, kolejność doświadczenia i linki źródłowe.
- Zachowane liczby: ponad 80 komponentów i ponad 15 stron gier w projekcie 2K.
- Goldnat: działająca strona i katalog; prywatne oferty i formularze pozostają
  prototypem wdrożonym do testów wewnętrznych, przed udostępnieniem klientom.
- Młyn nad Sanną: projekt wizualny przypisany grafikowi, implementacja Damianowi;
  strona nie jest systemem rezerwacji ani zarządzania dostępnością.
- Leaderna: praca w niepełnym wymiarze, równoległa do Xolv.io.
- Flyps: czas teraźniejszy dla aktualnej pracy; poprzednie role w czasie przeszłym.
- Nazwy technologii, produktów i branżowe nazwy stanowisk pozostają w oryginale,
  zgodnie z ustalonym stylem.

Wynik: treści kompletne, bez rozszerzania deklarowanego zakresu pracy.

## Przegląd językowy 2 — polszczyzna w gotowej stronie

Odczytano osobno tekst wszystkich dziewięciu polskich widoków z przeglądarki
i oceniono go jako samodzielną polską wersję. Zweryfikowano też słownik interfejsu,
metadane, podpisy i teksty dostępności w źródłach. Poprawiono:

- Niejasne „jej obecnością w internecie” w eLeader zastąpiono konkretnym zdaniem
  o współpracy z marketingiem i projektantami nad stroną firmy.
- „Łącząc przebieg nauki z odpowiedziami” zastąpiono zdaniem o połączeniu
  interfejsu z backendem i wykorzystaniu odpowiedzi AI w interaktywnej nauce.
- Uproszczono zdanie o wyszukiwaniu dokumentów i ocenie wyników AI.
- Uzupełniono „niepełny wymiar” do „niepełny wymiar czasu pracy”.
- „Odwiedź” przy nazwie realizacji doprecyzowano do „Odwiedź stronę”.
- Nagłówek „Współpracowałem z” zastąpiono „Doświadczenie”, eliminując samotne
  „z” w kolejnym wierszu; dostosowano rozmiar na telefonie, aby mieścił się licznik.

Wynik: osobisty, rzeczowy ton; krótkie etykiety, spójna terminologia, polskie znaki.
Oba przeglądy wykonał ten sam agent w dwóch osobnych etapach.

## Testy automatyczne i przeglądarka

- `npm.cmd run check`: 0 błędów, 0 ostrzeżeń.
- `npm.cmd run build`: 18 statycznych stron.
- `npm.cmd test`: 86/86 testów przechodzi. Nowe kontrole obejmują zgodność modeli,
  kompletność pól tłumaczenia, oba zestawy tras, linki i kotwice, metadane,
  etykiety animacji oraz ograniczenia opisów projektów.
- `npm.cmd run test:projects`: trzeci projekt z tłumaczeniem renderuje się
  na obu stronach głównych; po teście odtworzono dane i build z dwoma projektami.
- Osobny build z testowym `--site` w ignorowanym `.openai/i18n-seo/`:
  poprawne canonical oraz wzajemne EN/PL i x-default we wszystkich 18 widokach.
  Testowa domena nie została zapisana w konfiguracji ani standardowym buildzie.
- Chrome przez Playwright: PL ↔ EN na stronie głównej i podstronach;
  zachowanie `#work`, powrót do `#experience`, Wstecz/Dalej, język po przejściu.
- Nagłówek: pełny polski drugi wariant, pauza/wznowienie, zmiana języka po pauzie;
  prawidłowe nowe etykiety. Przejście do PL pokazuje „Strona główna”.
- Klawiatura: link pomijania treści ustawia fokus na `main`, Enter przełącza język.
- Bez JavaScript: dostępne teksty i zwykłe linki; przełącznik i wejście do realizacji działają.
- Reduced motion: czytelne statyczne treści i sprawna nawigacja.
- Wszystkie 18 stron sprawdzono pod kątem szerokości przy 360, 390, 768, 1024
  i 1440 px. Po korektach ponownie zmierzono teksty i liczniki strony głównej
  EN/PL także przy 320, 640 i 720 px — bez wyjścia poza ekran.
- Reflow odpowiadający powiększeniu 200% ekranu 1440×900 sprawdzono przy
  720×450 CSS px. To emulacja układu, nie test natywnego menu zoom przeglądarki.
- Wizualnie obejrzano hero, nawigację, O mnie, technologie, doświadczenie,
  karty, stopkę i podstrony, w tym mobilny nagłówek i przejście w trakcie animacji.
- W wykonanych przepływach nie wystąpiły błędy JavaScript, utrata możliwości
  przewijania, mieszanie języków ani obcięcie polskich treści po korektach.

Lokalne materiały z kontroli: `.openai/i18n/` (ignorowane przez Git), w tym
zrzuty mobilne/desktopowe, tekst do drugiego przeglądu i wyniki kontroli przeglądarkowej.
Nie wykonywano nowego audytu Safari/Firefox ani ręcznego testu z czytnikiem ekranu.
Przed publikacją należy ustawić rzeczywistą domenę `site`; nie wykonywano publikacji.

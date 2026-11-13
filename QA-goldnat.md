# Goldnat — weryfikacja 13 listopada 2026

- Astro check: 0 błędów, 0 ostrzeżeń, 0 wskazówek.
- Build: dwie statyczne strony, w tym `/work/goldnat/index.html`.
- Pełny zestaw testów: 54/54. Testy case study sprawdzają treść, status prototypu,
  nawigację, SEO, oryginalne obrazy i wygenerowane warianty.
- Test integracyjny trzeciego projektu: zaliczony; przywrócone dwa projekty i build.
- Cztery oryginalne JPEG mają takie same SHA256 jak dostarczone pliki.
- Lokalny endpoint `/work/goldnat/`: HTTP 200.
- Impeccable: skan zmienionych widoków nie zgłosił uwag.
- Po uwadze użytkownika zmieniono przejście ze wspólnego obrazu na przesłonę.
  Ponowiono build oraz testy dokumentów po tej zmianie.

## Przejście GSAP + Astro ClientRouter — aktualna implementacja

Build zakończony poprawnie; Astro check: 50 plików, 0 błędów/ostrzeżeń/wskazówek.
Pełny zestaw testów: 66/66. `git diff --check`: bez błędów whitespace.

Przesłona jest teraz trwałą warstwą HTML animowaną przez GSAP. Nie wymaga `pageswap`,
`pagereveal` ani natywnych View Transitions. Router używa `fallback="swap"`, a jego
natywna animacja jest pomijana również w przeglądarkach, które ją obsługują.
Zachowano 550 / 600 / 550 ms, CustomEase oraz nazwy Goldnat, Homepage i sekcji.
Wolne pobieranie wydłuża pełne zakrycie; limit 10 sekund uruchamia standardową nawigację.

Nowe testy sprawdzają brak natywnego API, oba porządki zakończenia pobierania i zasłaniania,
gotowość nowej strony, nazwy, reduced motion, anulowanie, resize, błędy i timeout,
zwalnianie blokad, pojedynczą inicjalizację routera i zachowanie historii kotwic.
Sprawdzenie DOM obejmuje trwałość przesłony i statyczną czytelność treści.

Kontrola wizualna aktualnej wersji nie została wykonana: narzędzie CUA zatrzymało
dostęp do Firefoxa komunikatem o braku obsługi egzekwowania polityki URL dla tej
przeglądarki na Windows. Firefox, Chromium, WebKit/Safari oraz mobile pozostają
wizualnie niezweryfikowane dla tej wersji. Testy jednostkowe nie są testami silników przeglądarek.

## Poprzednie przejście natywne — historia kontroli wizualnej

Przejście zastąpiono jednym jednolitym panelem: 550 ms rozciągania od lewej,
600 ms pełnego zakrycia, 550 ms zjazdu w prawo. Pod zakryciem osobny snapshot nazwy
strony docelowej pojawia się przez 150 ms, pozostaje przez 300 ms i znika przez 150 ms.
Usunięto kopie canvas i krzywe maski.
Panel stale pozostaje pod treścią; usunięto przełączanie widoczności w `pageswap`,
które mogło pokazać pełną przesłonę przed rozpoczęciem animacji. Obrys jest tylko na snapshocie.
Dodano testy zakończenia, anulowania, reduced motion, przywrócenia i pomijania wejścia kart.

Natywny dostęp CUA do Chrome umożliwił sprawdzenie otwarcia Goldnat i powrotu do #work
na desktopie. W konsoli wykryto `View Transition opt-in disabled`. Style przejścia
przeniesiono do head i usunięto BOM z CSS, który psuł pierwszą regułę w stylu inline.
Test dokumentu pilnuje obecności reguły przed pierwszą klatką i braku BOM.
Końcowy czas wynosi 1700 ms; ruch panelu używa cubic-bezier(.65, 0, .35, 1).

Kontrola klatek całej końcowej sekwencji jest niepełna: w trakcie podglądu użytkownik
korzystał z tego samego okna. Nie wykonano pełnej kontroli mobile, wolnej sieci,
Wstecz/Dalej ani zoomu 200%. Testy jednostkowe nie zastępują tych scenariuszy w przeglądarce.

Do późniejszego uzupełnienia: widok klienta po otwarciu prywatnej oferty oraz
formularz klienta. Nie są wymagane do działania obecnego case study.

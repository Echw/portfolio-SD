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

## Aktualizacja przejścia i kontrola wizualna

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

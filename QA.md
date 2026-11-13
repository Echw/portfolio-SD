# Weryfikacja — 6 listopada 2026

## Wykonane

| Sprawdzenie | Wynik |
| --- | --- |
| npm.cmd run check | 0 błędów, 0 ostrzeżeń, 0 wskazówek |
| Build produkcyjny | Statyczny build Astro, lokalne fonty, AVIF/WebP |
| npm.cmd test | 51 / 51 testów |
| npm.cmd run test:projects | Ponowiony prawdziwy build z trzema kartami, trzema rewersami i licznikiem 03; przywrócone dane i build z dwoma projektami |
| Typewriter | Prefiksy co 70 ms, dwa wiersze, hold 3,5 s, kasowanie co 50 ms, kursor, pełny cykl i niezależne blokady zachowujące pozostały czas |
| Reveal | Wykonany head bootstrap w VM: pełne załadowanie/reload, pomijanie kotwic/historii/reduced motion, przerwanie interakcją, zabezpieczenie 3 s i sprzątanie |
| Model tła | Deterministyczna geometria viewportu, limity linii/punktów, lokalny promień 180 px, odgięcie do 24 px, powrót do dokładnego zera poniżej 1,2 s i porównanie 60/120 Hz |
| Adapter tła | Rzeczywisty moduł z atrapą Canvas/GSAP: DPR 1,5, brak obsługi scrolla / pageY, jeden ticker tylko podczas reakcji, lokalny glow wygaszany w spoczynku, statyczne warianty, touch/blur/visibility/resize, brak kontekstu i błąd rysowania |
| Kafelki | Limit 3°; szybki enter/leave i przejście między kartami; anulowanie RAF; scroll pod nieruchomym kursorem i zasłonięcie karty; blokada podczas wejścia i po fokusie |
| Wspólna poświata | Rzeczywisty adapter z atrapą GSAP i rzeczywistym kontrolerem wskaźnika: Work tworzy rotację, Stack wyłącznie światło; scroll/leave i sprzątanie; transform wejścia Stack nie jest nadpisywany |
| Ikony Stack | 18 lokalnych, monochromatycznych inline SVG, aria-hidden / focusable=false, zachowane viewBox i geometria; źródła przypięte do commitów i pełne licencje. Osobny raster 28 px został obejrzany |
| Własny kursor | Adapter z atrapą GSAP/DOM: natywny do udanej klatki, dokładny punkt i 180 ms ring, stany link/tile/tło, scroll, kliknięcie, klawiatura, dotyk, wyjście/ukrycie okna, ponowne wejście, wyjątek i sprzątanie |
| Wjazd projektów | Rzeczywisty moduł z atrapami GSAP/DOM: start spod viewportu mierzony przy triggerze, przyjazd obu kart przed obrotem, 650 ms + obrót 180° / 1,1 s, odstęp 160 ms, once, fokus, sprzątanie i awaria inicjalizacji; pusty rewers w HTML |
| Geometria sceny | Budżet 1024×720, 1440×900 i 1536×1024 z przykładowymi naturalnymi pomiarami tekstu; określona wysokość sceny, proporcjonalna rama 2:1, brak limitu 200 px i fallback do naturalnego układu |
| Blokada scrolla | Rzeczywisty kontroler i adapter z atrapą Lenisa: dwa holdy / ostatnie zwolnienie, watchdog, odrzucenie wejścia, Escape/Tab, resize, historia, ukrycie karty, nawigacja, zniszczenie i wyjątek kadrowania |
| Kadrowanie sceny | Desktop fit kadruje sekcję; telefon, flow i kolejne wiersze kadrują aktywną kartę |
| Dokument | Dwa projekty, kolejność nazwa/zdjęcie/opis/zakres/odsyłacz, jeden CTA, pusty rewers i draggable=false; 18 statycznych kafelków Stack, ukryta warstwa kursora aria-hidden, kontakt i kotwice |
| Impeccable | Skan layout dla Backdrop.astro / index.astro / global.css zwrócił [] |
| Podgląd lokalny | Po restarcie serwera HTTP 200 pod http://127.0.0.1:4321/; kurtyna, bootstrap i cztery wyjścia tekstu obecne. Moduły hero/typewriter i CSS również HTTP 200 |

## Przegląd kodu

| Before | After | Why |
| --- | --- | --- |
| Przenikanie liter opacity/blur bez wejścia strony | Kurtyna 850 ms i wpisywanie/usuwanie rzeczywistego tekstu z kursorem | Odtworzenie uzgodnionego mechanizmu hero |
| Ponowne odliczanie pełnego czasu po pauzie | Zachowanie bieżącego znaku i pozostałej części opóźnienia | Wznowienie dokładnie od zatrzymanego miejsca |
| Przypinanie, ukrywanie projektów i kontrolki slajdów | Wszystkie kafelki w siatce, każdy z jednym linkiem | Projekty pozostają dostępne równocześnie |
| Zdarzenia myszy na obracanym elemencie | Nieruchomy link, osobne warstwy obrotu i pochylenia, wizualne potomki bez hit-testów | Poruszająca się krawędź nie przełącza hover |
| Szeroki pasek zdjęcia 160–200 px i stały kadr 82% | Rama 2:1 o proporcjonalnej szerokości, marginesy, Goldnat 75% / Młyn 55% | Rozmiar fotografii nie niszczy kompozycji źródła |
| Min-height sekcji i przypadkowa luka przed stopką | Określona wysokość sceny i pięć wierszy karty z elastycznym obszarem opisu | Karty wypełniają scenę, a przestrzeń dzieli grupy treści |
| Zawsze kadrowana cała sekcja, również dla drugiej karty telefonu | Sekcja wyłącznie dla desktop fit, w pozostałych przypadkach aktywna karta | Wejście kolejnych projektów nie cofa użytkownika |
| Opacity na tej samej warstwie co obrót 3D | Osobny rodzic dla opacity/wjazdu i rotor zachowujący preserve-3d | Przenikanie nie spłaszcza dwóch stron karty |
| Pigułki Stack | Prostokątne kafelki 6/4/2 ze wspólną poświatą | Spójność z Work i nieruchomy obszar myszy |
| Blok max-width wyrównany do lewej i nazwy przy lewej krawędzi | Margin auto, centrowane niepełne rzędy, wspólne pole ikony i dwuwierszowej nazwy | Symetryczna siatka i stałe osie zawartości |
| Osobne potencjalne silniki światła | Jeden adapter i kontroler dla Work oraz Stack, rotacja tylko w Work | Wspólne zachowanie i sprzątanie |
| Globalne ukrycie systemowego kursora | Ukrycie dopiero po udanej klatce, przywrócenie po błędzie lub przerwaniu | Brak niewidzialnego wskaźnika przy awarii |
| Jednolite tło | Fixed canvas poza main, treść na wyższej warstwie, model w clientX/clientY | Wzór pozostaje przy oknie podczas przewijania contentu |
| Osobne tweens window.scrollTo | Lenis spięty z jednym tickerem GSAP | Jeden właściciel wygładzania i kotwic |
| Wspólny moduł animacji | Moduły hero, kart, scrolla i koordynator | Jawne sprzątanie zegarów, listenerów i obserwatorów |
| Możliwe wznowienie po cofnięciu jednej blokady | Niezależne blokady użytkownika, widoczności i karty | Pauza nie znika przez inne zdarzenie |
| Odsyłacz kotwicą odtwarzany także po BFCache | Odtworzenie hash tylko przy pierwszej inicjalizacji | Powrót do strony nie wymusza skoku do dawnej kotwicy |

## Ograniczenia

Computer Use nadal zwraca brak hosta przeglądarki i niedostępną usługę aplikacji natywnych.
Nie wykonano wizualnej kontroli szerokości 360–1536 px, zoomu 200%, fizycznego wskazywania
kafelków, faktycznego przewijania, dotyku ani pomiaru płynności.

Testy timera, bootstrapu i pochylenia są testami logiki, nie potwierdzeniem zachowania w przeglądarce.
Obejrzano oba oryginalne pliki zdjęć. Test budżetu nie mierzy rzeczywistego DOM: ostateczne
kadry, rozłożenie tekstu i dopasowanie kart wymagają jeszcze kontroli wizualnej w przeglądarce.
Także obrót, blokada scrolla i usunięcie migotania nie zostały obejrzane w działającej przeglądarce.
Próba Computer Use w tej rundzie ponownie zwróciła brak hosta. Skan Impeccable bez uwag
nie zastępuje screenshotów ani interakcji w silniku przeglądarki.
Nie obejrzano także nowej siatki Stack i kursora ani nie wykonano faktycznego przeciągania
zaznaczenia / kopiowania tekstu. Te przypadki, media queries oraz płynność wymagają kontroli
w przeglądarce; testy adapterów nie uruchamiają jej silnika.
Nieruchomość warstwy, kontrast linii pod rzeczywistą typografią i płynność nowego tła również
pozostają niezweryfikowane w silniku przeglądarki. Próba CUA w tej rundzie ponownie zwróciła brak hosta.
W tej rundzie obejrzano raster samych lokalnych ikon.
To kontrola znaków przy 28 px, a nie screenshot HTML/CSS. Rzeczywiste wyrównanie przy
360/768/1024/1536 px i na hover pozostaje do kontroli w przeglądarce; ponowna próba CUA zwróciła brak hosta.
Nie obejrzano pierwszych sekund revealu ani pełnej pętli typewritera; zgodność wizualna
z Edwinem pozostaje niezweryfikowana. Podczas tej poprawki ponowiono próbę Computer Use — host nadal niedostępny.
Build i HTTP 200 nie zastępują tej kontroli. Scenariusze ręczne są w README.

CodePen RwqrwJX zwracał 403. Efekt światła opiera się na zatwierdzonym opisie;
nie potwierdzono zgodności wizualnej 1:1 z tym demem. Strona nie została opublikowana.

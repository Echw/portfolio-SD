import { goldnat as englishGoldnat, mlynNadSanna as englishSanna, type CaseStudy, type CaseStudySection } from '../case-studies';

type SectionCopy = Pick<CaseStudySection, 'title' | 'paragraphs'> & { figures?: { alt: string; caption: string }[] };
type StudyCopy = Pick<CaseStudy, 'subtitle' | 'description' | 'coverAlt' | 'contributions'> & { sections: Record<string, SectionCopy> };

export const caseStudyCopy: Record<string, StudyCopy> = {
  goldnat: {
    subtitle: 'Katalog samochodów i narzędzia dopasowane do pracy zespołu sprzedaży.',
    description: 'Jak zbudowałem stronę Goldnat i dostosowałem Payload CMS do przygotowywania zestawień samochodów, prywatnych ofert i formularzy dla klientów.',
    coverAlt: 'Czarny samochód przed ciepło oświetlonym betonowym budynkiem nocą. Zdjęcie ze strony Goldnat.',
    contributions: ['Tworzenie aplikacji full-stack', 'Dostosowanie Payload CMS', 'Narzędzia sprzedażowe', 'Wdrożenie'],
    sections: {
      context: {
        title: 'Strona połączona z procesem sprzedaży',
        paragraphs: [
          'Goldnat oferuje długoterminowy wynajem samochodów z możliwością wykupu. Projekt łączy publiczny katalog pojazdów z panelem administracyjnym dla zespołu zarządzającego ofertami.',
          'Wspólnie z klientem ustaliłem wymagania, a następnie zbudowałem stronę, integrację z CMS i narzędzia wspierające sprzedaż. Odpowiadałem za interfejs dla klientów, strukturę danych, panel administracyjny i wdrożenie.',
        ],
      },
      'offer-terms': {
        title: 'Przejrzyste warunki oferty',
        paragraphs: [
          'Publiczny katalog pokazuje informacje potrzebne klientowi przed kontaktem: samochód, miesięczną ratę, opłatę wstępną i liczbę rat. Użytkownik może przeszukiwać i filtrować katalog, otworzyć stronę pojazdu oraz zapytać o konkretną ofertę.',
          'Oferty widoczne dla klientów opierają się na zapisanych warunkach finansowania. Osobny kalkulator pomaga pracownikom szybko sprawdzić wyliczenia podczas rozmowy o ofercie.',
        ],
        figures: [{
          alt: 'Pola finansowania w Payload CMS: miesięczna rata, opłata wstępna, liczba rat i wybór wariantu głównego.',
          caption: 'Zapisane warunki finansowania w Payload: miesięczna rata, opłata wstępna i liczba rat.',
        }],
      },
      'vehicle-management': {
        title: 'Zarządzanie katalogiem',
        paragraphs: ['Publikacja, widoczność i dostępność pojazdu to osobne ustawienia w panelu. Zmiana jednego z nich nie wpływa automatycznie na pozostałe.'],
        figures: [
          {
            alt: 'Lista pojazdów Goldnat w Payload CMS z wyszukiwarką, widokami publikacji oraz kolumnami roku, przebiegu, paliwa i skrzyni biegów.',
            caption: 'Katalog pojazdów w Payload z wyszukiwarką i osobnymi widokami według statusu publikacji.',
          },
          {
            alt: 'Pola parametrów pojazdu w Payload CMS: paliwo, nadwozie, skrzynia biegów, pojemność silnika, moc i liczba miejsc.',
            caption: 'Parametry pojazdów zapisane w uporządkowanych polach panelu administracyjnego.',
          },
        ],
      },
      'sales-workflows': {
        title: 'Payload dopasowany do zespołu',
        paragraphs: [
          'Rozbudowałem Payload CMS o narzędzia do przygotowywania zestawień samochodów dla konkretnych klientów i udostępniania ich przez prywatne linki. Stworzyłem też formularze, które handlowcy mogą wysłać po rozmowie z klientem, a odpowiedzi odczytać w panelu.',
          'System łączy wysłane zapytania z odpowiedziami, zachowuje ich historię i pozwala przesłać nowy link do wprowadzenia poprawek. Całość odpowiada kolejności pracy zespołu: wybrać pasujące samochody, przesłać ofertę i zebrać informacje potrzebne do kolejnego kroku.',
        ],
        figures: [{
          alt: 'Zestawienie pojazdów dla klienta w Payload: dwa samochody oraz opcje dodawania pojazdów i zmiany ich kolejności.',
          caption: 'Przygotowanie zestawienia samochodów dla klienta i ustalenie ich kolejności.',
        }],
      },
      delivered: {
        title: 'Co zostało wdrożone',
        paragraphs: ['Publiczna strona i katalog już działają. Wdrożyłem również prototyp prywatnych ofert i formularzy do testów wewnętrznych zespołu. Rozszerza on stronę o narzędzia sprzedażowe; udostępnienie ich klientom ma nastąpić po sprawdzeniu procesu w praktyce.'],
      },
    },
  },
  'mlyn-nad-sanna': {
    subtitle: 'Od projektu graficznego do działającej strony pensjonatu.',
    description: 'Jak wdrożyłem responsywną stronę Młyna nad Sanną na podstawie projektu grafika — z Sanity CMS, integracjami i przekazaniem całości klientowi.',
    coverAlt: 'Jesienne drzewa odbijające się w rzece Sannie. Zdjęcie ze strony Młyna nad Sanną.',
    contributions: ['Wdrożenie projektu graficznego', 'Responsywny układ i interakcje', 'Sanity CMS', 'Integracje', 'Uruchomienie i przekazanie strony'],
    sections: {
      context: {
        title: 'Projekt graficzny jako działająca strona',
        paragraphs: [
          'Młyn nad Sanną to pensjonat w Zaklikowie. Strona przedstawia obiekt, jego pokoje i apartamenty oraz pozwala gościom bezpośrednio zapytać o pobyt.',
          'Projekt wizualny przygotował grafik. Moim zadaniem było wdrożenie go jako responsywnej strony, dodanie interakcji oraz połączenie interfejsu z edytowalną treścią i zewnętrznymi usługami.',
        ],
        figures: [{
          alt: 'Strona główna Młyna nad Sanną z typografią z projektu grafika, zdjęciem rzeki i nawigacją.',
          caption: 'Projekt graficzny po wdrożeniu: typografia, zdjęcie rzeki i nawigacja na stronie głównej.',
        }],
      },
      'across-pages': {
        title: 'Spójność na każdej podstronie',
        paragraphs: [
          'Wdrożyłem stronę główną, listę pokoi, ich podstrony oraz informacje o obiekcie. Podstrony pokoi łączą zdjęcia, liczbę miejsc, wyposażenie i ceny. Galerie i formularz kontaktowy pomagają gościom poznać miejsce i zadać pytania.',
          'Odwzorowałem typografię, kolory i detale projektu w układach na komputery i telefony. Odpowiadałem za kod i działanie strony; autorem koncepcji wizualnej jest grafik.',
        ],
        figures: [{
          alt: 'Podstrona apartamentu Młyna nad Sanną: liczba gości, nazwa, cena za noc, zdjęcie i wyposażenie.',
          caption: 'Liczba miejsc, wyposażenie i ceny pokoju przedstawione zgodnie z dostarczonym projektem graficznym.',
        }],
      },
      'content-management': {
        title: 'Treści pod kontrolą klienta',
        paragraphs: [
          'Zintegrowałem Sanity CMS, aby klient mógł edytować opisy pokoi, zdjęcia i pozostałe treści strony. Model danych oddziela pokoje od informacji wspólnych dla całego obiektu. Dzięki temu te same dane zasilają zarówno listę pokoi, jak i ich podstrony.',
          'Wdrożyłem też formularz kontaktowy i potwierdzenia e-mail, zintegrowałem wpisy z Instagrama oraz skonfigurowałem metadane i dane strukturalne. Strona służy do bezpośrednich zapytań o pobyt — nie obsługuje rezerwacji ani zarządzania dostępnością pokoi.',
        ],
        figures: [{
          alt: 'Edytor pokoju w Sanity CMS z ustawieniami widoczności, nazwą pokoju, opcją wyświetlania w karuzeli strony głównej i tytułem karty.',
          caption: 'Edycja pokoju w Sanity: nazwa, widoczność na stronie oraz sposób prezentacji na liście i w karuzeli strony głównej.',
        }],
      },
      delivered: {
        title: 'Uruchomienie i przekazanie strony',
        paragraphs: [
          'Uruchomiłem stronę i przeniosłem repozytorium, hosting oraz CMS na konta klienta. Przekazanie obejmowało migrację treści i zdjęć, podłączenie domeny oraz konfigurację integracji w nowym środowisku.',
          'Efektem jest działająca strona oparta na projekcie grafika, z panelem do edycji treści i infrastrukturą należącą do klienta.',
        ],
      },
    },
  },
};

function localizeStudy(study: CaseStudy): CaseStudy {
  const copy = caseStudyCopy[study.id];
  if (!copy) throw new Error(`Missing Polish case study: ${study.id}`);
  return {
    ...study, ...copy,
    sections: study.sections.map((section) => {
      const translated = copy.sections[section.id];
      if (!translated || (translated.figures?.length ?? 0) !== (section.figures?.length ?? 0)) {
        throw new Error(`Incomplete Polish case study section: ${study.id}/${section.id}`);
      }
      return { ...section, ...translated, figures: section.figures?.map((figure, index) => ({ ...figure, ...translated.figures![index] })) };
    }),
  };
}

export const goldnat = localizeStudy(englishGoldnat);
export const mlynNadSanna = localizeStudy(englishSanna);

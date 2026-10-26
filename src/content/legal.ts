import type { Locale } from '@/lib/types';

export type LegalDocId = 'terms' | 'privacy' | 'cookies';

interface LegalDoc {
  title: Record<Locale, string>;
  updated: Record<Locale, string>;
  sections: Array<{ heading: Record<Locale, string>; body: Record<Locale, string[]> }>;
}

const ADMIN = {
  name: 'Jakub Wojtowicz',
  email: 'redakcja@twarzekultury.pl',
  site: 'Twarze Kultury',
  url: 'https://twarzekultury.pl',
};

export const LEGAL_META = ADMIN;

export const LEGAL_DOCS: Record<LegalDocId, LegalDoc> = {
  terms: {
    title: { pl: 'Regulamin', en: 'Terms of Service' },
    updated: { pl: 'Ostatnia aktualizacja: 26 października 2026 r.', en: 'Last updated: 26 October 2026' },
    sections: [
      {
        heading: { pl: '1. Postanowienia ogólne', en: '1. General provisions' },
        body: {
          pl: [
            `Niniejszy Regulamin określa zasady korzystania z serwisu internetowego ${ADMIN.site} (dalej: „Serwis”), dostępnego pod adresem ${ADMIN.url} oraz domenami powiązanymi.`,
            `Administratorem Serwisu jest ${ADMIN.name}, kontakt: ${ADMIN.email} (dalej: „Administrator”).`,
            'Korzystanie z Serwisu oznacza akceptację niniejszego Regulaminu. Jeżeli nie akceptujesz jego treści, prosimy o niekorzystanie z Serwisu.',
          ],
          en: [
            `These Terms govern use of the ${ADMIN.site} website (the “Service”), available at ${ADMIN.url} and related domains.`,
            `The Service is operated by ${ADMIN.name}, contact: ${ADMIN.email} (the “Administrator”).`,
            'Using the Service means you accept these Terms. If you do not agree, please do not use the Service.',
          ],
        },
      },
      {
        heading: { pl: '2. Charakter Serwisu', en: '2. Nature of the Service' },
        body: {
          pl: [
            'Serwis jest niezależnym magazynem kulturalnym publikującym treści redakcyjne z zakresu muzyki, filmu, sportu i gier.',
            'Treści mają charakter informacyjny i publicystyczny. Nie stanowią porady prawnej, medycznej ani inwestycyjnej.',
            'Administrator dokłada starań, aby treści były rzetelne, jednak nie gwarantuje ich pełnej aktualności ani kompletności.',
          ],
          en: [
            'The Service is an independent culture magazine publishing editorial content about music, film, sport and games.',
            'Content is informational and journalistic. It is not legal, medical or investment advice.',
            'The Administrator aims for accuracy but does not guarantee that all content is complete or up to date.',
          ],
        },
      },
      {
        heading: { pl: '3. Zasady korzystania', en: '3. Acceptable use' },
        body: {
          pl: [
            'Użytkownik zobowiązuje się korzystać z Serwisu zgodnie z prawem, dobrymi obyczajami oraz niniejszym Regulaminem.',
            'Zabronione jest: podejmowanie działań naruszających bezpieczeństwo Serwisu, automatyczne scrapowanie treści w sposób nadmiernie obciążający infrastrukturę, publikowanie bez zgody treści Administratora poza dozwolonym użytkiem osobistym oraz działania naruszające prawa osób trzecich.',
            'Administrator może ograniczyć dostęp do Serwisu w razie naruszenia Regulaminu lub zagrożenia bezpieczeństwa.',
          ],
          en: [
            'Users must use the Service lawfully, in good faith and in line with these Terms.',
            'It is forbidden to attack or overload the Service, scrape content in a way that harms infrastructure, republish Service content without permission beyond personal use, or infringe third-party rights.',
            'The Administrator may restrict access if these Terms are breached or security is at risk.',
          ],
        },
      },
      {
        heading: { pl: '4. Prawa autorskie', en: '4. Copyright' },
        body: {
          pl: [
            `Treści publikowane w Serwisie (teksty, zdjęcia, grafiki, układ strony) są chronione prawem autorskim. Prawa przysługują Administratorowi lub podmiotom, z którymi zawarto odpowiednie umowy.`,
            'Kopiowanie, rozpowszechnianie lub modyfikowanie treści bez zgody Administratora jest zabronione, z wyjątkiem dozwolonego użytku wynikającego z przepisów prawa.',
          ],
          en: [
            'Content on the Service (text, images, graphics, layout) is protected by copyright owned by the Administrator or licensed partners.',
            'Copying, distributing or modifying content without permission is prohibited, except where permitted by law.',
          ],
        },
      },
      {
        heading: { pl: '5. Odpowiedzialność', en: '5. Liability' },
        body: {
          pl: [
            'Serwis jest udostępniany „w stanie, w jakim jest”. Administrator nie ponosi odpowiedzialności za przerwy w działaniu, utratę danych po stronie użytkownika ani szkody wynikłe z korzystania lub niemożności korzystania z Serwisu, w zakresie dopuszczonym przez prawo.',
            'Linki do stron zewnętrznych prowadzą do serwisów niezależnych — Administrator nie odpowiada za ich treść ani politykę prywatności.',
          ],
          en: [
            'The Service is provided “as is”. To the extent permitted by law, the Administrator is not liable for downtime, user-side data loss, or damages arising from use or inability to use the Service.',
            'External links lead to independent sites; the Administrator is not responsible for their content or privacy practices.',
          ],
        },
      },
      {
        heading: { pl: '6. Zmiany Regulaminu', en: '6. Changes' },
        body: {
          pl: [
            'Administrator może zmieniać Regulamin. Nowa treść obowiązuje od chwili publikacji w Serwisie, chyba że wskazano inaczej.',
            'W sprawach nieuregulowanych zastosowanie mają przepisy prawa polskiego.',
          ],
          en: [
            'The Administrator may update these Terms. The new version applies from publication on the Service unless stated otherwise.',
            'Matters not covered here are governed by Polish law.',
          ],
        },
      },
      {
        heading: { pl: '7. Kontakt', en: '7. Contact' },
        body: {
          pl: [
            `Administrator: ${ADMIN.name}`,
            `E-mail: ${ADMIN.email}`,
          ],
          en: [
            `Administrator: ${ADMIN.name}`,
            `Email: ${ADMIN.email}`,
          ],
        },
      },
    ],
  },

  privacy: {
    title: { pl: 'Polityka prywatności', en: 'Privacy Policy' },
    updated: { pl: 'Ostatnia aktualizacja: 26 października 2026 r.', en: 'Last updated: 26 October 2026' },
    sections: [
      {
        heading: { pl: '1. Administrator danych', en: '1. Data controller' },
        body: {
          pl: [
            `Administratorem danych osobowych jest ${ADMIN.name}, kontakt: ${ADMIN.email}.`,
            'W sprawach ochrony danych możesz napisać na powyższy adres e-mail.',
          ],
          en: [
            `The data controller is ${ADMIN.name}, contact: ${ADMIN.email}.`,
            'For privacy requests, write to that email address.',
          ],
        },
      },
      {
        heading: { pl: '2. Zakres i cele przetwarzania', en: '2. Scope and purposes' },
        body: {
          pl: [
            'Serwis w podstawowej formie umożliwia czytanie treści bez rejestracji konta.',
            'Możemy przetwarzać dane w następujących celach:',
            '• zapewnienie działania Serwisu (podstawa: prawnie uzasadniony interes — art. 6 ust. 1 lit. f RODO),',
            '• obsługa korespondencji e-mail (podstawa: art. 6 ust. 1 lit. b lub f RODO),',
            '• analityka i poprawa Serwisu — wyłącznie po wyrażeniu zgody na cookies analityczne (art. 6 ust. 1 lit. a RODO),',
            '• marketing własny — wyłącznie po zgodzie na cookies marketingowe (art. 6 ust. 1 lit. a RODO).',
            'Podanie danych jest dobrowolne, a w przypadku cookies opcjonalnych — zależne od Twojej decyzji w banerze zgody.',
          ],
          en: [
            'The Service can be read without creating an account.',
            'We may process data for:',
            '• operating the Service (legitimate interest — GDPR Art. 6(1)(f)),',
            '• handling email correspondence (Art. 6(1)(b) or (f)),',
            '• analytics — only with consent to analytics cookies (Art. 6(1)(a)),',
            '• marketing — only with consent to marketing cookies (Art. 6(1)(a)).',
            'Providing data is voluntary; optional cookies depend on your choice in the consent banner.',
          ],
        },
      },
      {
        heading: { pl: '3. Odbiorcy danych', en: '3. Recipients' },
        body: {
          pl: [
            'Dane mogą być powierzane dostawcom hostingu, poczty e-mail oraz — po zgodzie — narzędzi analitycznych lub reklamowych, wyłącznie w zakresie niezbędnym do świadczenia usług.',
            'Dane nie są sprzedawane. Przekazanie poza EOG następuje wyłącznie przy zapewnieniu odpowiednich zabezpieczeń wymaganych RODO.',
          ],
          en: [
            'Data may be shared with hosting and email providers and — with consent — analytics or advertising tools, only as needed to run the Service.',
            'We do not sell personal data. Transfers outside the EEA occur only with GDPR-required safeguards.',
          ],
        },
      },
      {
        heading: { pl: '4. Okres przechowywania', en: '4. Retention' },
        body: {
          pl: [
            'Dane z korespondencji przechowujemy przez czas potrzebny do odpowiedzi i ewentualnego dochodzenia roszczeń, zwykle nie dłużej niż 3 lata, chyba że dłuższy okres wynika z prawa.',
            'Zgoda na cookies jest pamiętana w przeglądarce (localStorage) do czasu jej zmiany lub wyczyszczenia danych witryny.',
          ],
          en: [
            'Correspondence data is kept as long as needed to reply and for potential claims, usually up to 3 years unless law requires longer.',
            'Cookie consent is stored in your browser (localStorage) until you change it or clear site data.',
          ],
        },
      },
      {
        heading: { pl: '5. Prawa użytkownika', en: '5. Your rights' },
        body: {
          pl: [
            'Przysługuje Ci prawo dostępu do danych, sprostowania, usunięcia, ograniczenia przetwarzania, przenoszenia danych, sprzeciwu oraz cofnięcia zgody w dowolnym momencie (bez wpływu na zgodność z prawem przetwarzania sprzed cofnięcia).',
            'Masz prawo wnieść skargę do Prezesa Urzędu Ochrony Danych Osobowych (uodo.gov.pl).',
          ],
          en: [
            'You have the right of access, rectification, erasure, restriction, portability, objection, and to withdraw consent at any time (without affecting prior lawful processing).',
            'You may lodge a complaint with the Polish Data Protection Authority (UODO) or your local supervisory authority.',
          ],
        },
      },
      {
        heading: { pl: '6. Pliki cookies', en: '6. Cookies' },
        body: {
          pl: [
            'Szczegóły dotyczące cookies oraz sposobu zarządzania zgodą znajdują się w Polityce cookies.',
          ],
          en: [
            'Details about cookies and managing consent are in the Cookie Policy.',
          ],
        },
      },
      {
        heading: { pl: '7. Kontakt', en: '7. Contact' },
        body: {
          pl: [
            `Administrator: ${ADMIN.name}`,
            `E-mail: ${ADMIN.email}`,
          ],
          en: [
            `Administrator: ${ADMIN.name}`,
            `Email: ${ADMIN.email}`,
          ],
        },
      },
    ],
  },

  cookies: {
    title: { pl: 'Polityka cookies', en: 'Cookie Policy' },
    updated: { pl: 'Ostatnia aktualizacja: 26 października 2026 r.', en: 'Last updated: 26 October 2026' },
    sections: [
      {
        heading: { pl: '1. Czym są cookies', en: '1. What cookies are' },
        body: {
          pl: [
            'Cookies (i podobne technologie, w tym localStorage) to niewielkie informacje zapisywane w urządzeniu użytkownika podczas korzystania z Serwisu.',
            'Używamy ich, aby Serwis działał poprawnie, zapamiętać Twoje decyzje o zgodzie oraz — wyłącznie za zgodą — prowadzić analitykę lub działania marketingowe.',
          ],
          en: [
            'Cookies (and similar technologies such as localStorage) are small pieces of data stored on your device when you use the Service.',
            'We use them to make the Service work, remember your consent choices, and — only with consent — for analytics or marketing.',
          ],
        },
      },
      {
        heading: { pl: '2. Rodzaje cookies', en: '2. Cookie categories' },
        body: {
          pl: [
            'Niezbędne — wymagane do podstawowego działania Serwisu i zapamiętania Twojej decyzji o zgodzie. Nie wymagają zgody (art. 173–174 Prawa telekomunikacyjnego w związku z ePrivacy / RODO).',
            'Preferencje — zapamiętują ustawienia (np. język, wygląd). Włączane po zgodzie.',
            'Analityczne — pomagają zrozumieć, jak korzystasz z Serwisu (np. popularne treści). Włączane po zgodzie.',
            'Marketingowe — służą personalizacji komunikatów lub reklam. Włączane po zgodzie.',
          ],
          en: [
            'Necessary — required for the Service to work and to store your consent choice. These do not require consent under ePrivacy rules.',
            'Preferences — remember settings (e.g. language). Enabled only with consent.',
            'Analytics — help us understand how the Service is used. Enabled only with consent.',
            'Marketing — used for personalized messages or ads. Enabled only with consent.',
          ],
        },
      },
      {
        heading: { pl: '3. Zarządzanie zgodą', en: '3. Managing consent' },
        body: {
          pl: [
            'Przy pierwszej wizycie wyświetlamy baner, w którym możesz: zaakceptować wszystkie cookies, odrzucić opcjonalne albo wybrać kategorie indywidualnie.',
            'Twoja decyzja jest zapisywana w localStorage przeglądarki, aby baner nie pojawiał się przy kolejnych wizytach.',
            'Zgodę możesz zmienić w dowolnym momencie — link „Ustawienia cookies” znajduje się w stopce Serwisu.',
            'Możesz też usunąć dane witryny w ustawieniach przeglądarki; wtedy baner pojawi się ponownie.',
          ],
          en: [
            'On your first visit we show a banner where you can accept all cookies, reject optional ones, or choose categories.',
            'Your choice is stored in localStorage so the banner does not reappear on every visit.',
            'You can change consent anytime via “Cookie settings” in the footer.',
            'Clearing site data in your browser will show the banner again.',
          ],
        },
      },
      {
        heading: { pl: '4. Administrator', en: '4. Controller' },
        body: {
          pl: [
            `Administrator Serwisu: ${ADMIN.name}`,
            `Kontakt: ${ADMIN.email}`,
          ],
          en: [
            `Service administrator: ${ADMIN.name}`,
            `Contact: ${ADMIN.email}`,
          ],
        },
      },
    ],
  },
};

export const LEGAL_PATHS: Record<LegalDocId, string> = {
  terms: '/regulamin',
  privacy: '/polityka-prywatnosci',
  cookies: '/cookies',
};

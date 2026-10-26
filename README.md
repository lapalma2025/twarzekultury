# Twarze Kultury — portal

Next.js (App Router) + Supabase. Odtworzenie designu z `design-reference/` jako
w pełni działający, dwujęzyczny (PL/EN) portal z panelem administracyjnym.

## Szybki start

```bash
npm install
npm run dev
```

Otwórz http://localhost:3000 — przekieruje na `/pl`. Panel admina: `/admin/login`.

**Tryb lokalny (bez Supabase):** dopóki `NEXT_PUBLIC_SUPABASE_URL` /
`NEXT_PUBLIC_SUPABASE_ANON_KEY` są puste w `.env.local`, wszystkie dane
(artykuły) trzymane są w pliku `data/db.json` (auto-tworzony, wypełniony
przykładową treścią). Panel admina działa od razu — logowanie, dodawanie,
edycja, usuwanie i publikacja artykułów, upload zdjęć (do `public/uploads/`).
To pozwala od razu testować i rozwijać portal, zanim projekt Supabase zostanie
podłączony.

Domyślne dane logowania lokalnego admina są w `.env.local`
(`ADMIN_EMAIL` / `ADMIN_PASSWORD_HASH`). Zmiana hasła:

```bash
node scripts/hash-password.mjs "nowe-haslo"
# wklej wynik (z wyescapowanymi $) jako ADMIN_PASSWORD_HASH w .env.local
```

## Podłączenie Supabase (produkcja)

1. Utwórz projekt na [supabase.com](https://supabase.com).
2. W **SQL Editor** uruchom całą zawartość `supabase/schema.sql` — tworzy
   tabele `articles`/`profiles`, RLS (publiczny odczyt tylko opublikowanych
   artykułów, pełny dostęp tylko dla adminów), bucket `article-images` w
   Storage z politykami dostępu.
3. W **Project Settings → API** skopiuj `Project URL` i `anon public` key do
   `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```
4. Załóż konto admina: **Authentication → Users → Add user** (e-mail + hasło),
   następnie w SQL Editor:
   ```sql
   insert into public.profiles (id, email)
   select id, email from auth.users where email = 'twoj@email.pl';
   ```
5. Restart `npm run dev` / redeploy. Aplikacja automatycznie przełącza się na
   Supabase — logowanie w `/admin/login` używa teraz Supabase Auth, artykuły
   czytane/zapisywane są w Postgresie, zdjęcia trafiają do Supabase Storage.
   Kod źródłowy nie wymaga żadnych zmian (`src/lib/data/articles.ts` wybiera
   backend automatycznie na podstawie obecności zmiennych środowiskowych).

## Dwujęzyczność (i18n)

- Interfejs (nawigacja, etykiety, stopka, itp.) — słowniki w `messages/pl.json`
  i `messages/en.json` (next-intl), routing `/pl/...` i `/en/...`.
- Treść artykułów — każdy artykuł ma osobne pola PL/EN (tytuł, lead, treść,
  slug) edytowalne równolegle w panelu admina (zakładki „Polski” / „English”).
- Przełącznik języka: flagi 🇵🇱 / 🇬🇧 po prawej stronie górnego menu.
- SEO: `hreflang`/`alternates.languages` na każdej stronie (PL ↔ EN), osobny
  `sitemap.xml` z wpisami dla obu języków.

## Panel administracyjny

`/admin` (po zalogowaniu): lista artykułów, `+ Nowy artykuł`, edycja, usuwanie.
Formularz artykułu: kategoria/podkategoria, tytuł/lead/treść PL i EN osobno
(treść w Markdown: `**pogrubienie**`, `*kursywa*`, `## nagłówek`, `> cytat`),
upload zdjęcia głównego, autor, czas czytania, ocena, tagi, status
szkic/opublikowany, oznaczenie „wyróżniony” (trafia do hero na stronie
głównej).

## Bezpieczeństwo (§1f umowy)

- **Uwierzytelnianie panelu** — Supabase Auth (produkcja) lub podpisana,
  `httpOnly`, `SameSite=Lax` ciasteczkowa sesja (tryb lokalny); hasła hashowane
  bcryptem. Middleware (`src/middleware.ts`) + kontrola w `admin/(protected)/layout.tsx`
  na każdym żądaniu (nie tylko w middleware).
- **CSRF** — mutacje panelu wyłącznie przez Next.js Server Actions (wbudowana
  weryfikacja `Origin`), żadnych REST endpointów przyjmujących zapis bez tej
  ochrony.
- **XSS** — treść artykułu renderowana z Markdown przez `marked`, a wynikowy
  HTML zawsze przepuszczany przez `sanitize-html` (allow-list tagów/atrybutów)
  przy każdym renderze strony — nawet gdyby baza została kiedyś skompromitowana,
  strona nie wykona wstrzykniętego skryptu. Reszta treści renderowana przez
  Reacta (auto-escaping).
- **Walidacja danych wejściowych** — `zod` po stronie serwera dla każdego
  zapisu artykułu i logowania (długości, format sluga, zakresy liczb, typy).
- **Bezpieczne zarządzanie sesją** — ciasteczka `httpOnly`; `Secure` w
  produkcji; RLS w Postgresie jako druga warstwa (nawet przy błędzie w
  aplikacji baza sama odrzuci nieautoryzowany zapis/odczyt szkiców).
- **HTTPS** — nagłówek `Strict-Transport-Security` (HSTS) ustawiony globalnie
  w `next.config.mjs`; samo terminowanie TLS zależy od hostingu (Vercel/
  reverse proxy) — włącz wymuszone HTTPS na domenie produkcyjnej.
- Dodatkowe nagłówki: `Content-Security-Policy`, `X-Frame-Options: DENY`,
  `X-Content-Type-Options: nosniff`, `Referrer-Policy`.

## SEO (§1e umowy)

- Meta-tagi (`generateMetadata`) na każdej stronie: tytuł, opis, Open Graph.
- Przyjazne adresy URL: `/kategoria/<kategoria>?sub=<podkategoria>`,
  `/artykul/<slug>` (osobny slug PL/EN).
- `sitemap.xml` (`src/app/sitemap.ts`) i `robots.txt` generowane dynamicznie
  z bazy artykułów.
- Dane strukturalne `NewsArticle` (JSON-LD) na stronie artykułu.
- `hreflang` / `alternates.languages` (PL ↔ EN, `x-default`) na każdej stronie.

## Struktura projektu

```
src/app/[locale]/          strony publiczne (PL/EN): strona główna, kategoria, artykuł
src/app/admin/              panel admina (logowanie + CRUD artykułów, poza i18n)
src/components/              komponenty UI (nav, sekcje strony głównej, ikony SVG animowane GSAP-em)
src/lib/data/                warstwa danych: Supabase albo lokalny store (przezroczyście)
src/lib/auth/                logowanie lokalne / Supabase Auth
src/lib/supabase/            klienci Supabase (przeglądarka/serwer/middleware)
src/lib/validation/          walidacja zod
messages/                    słowniki i18n (pl.json, en.json)
supabase/schema.sql          schemat bazy + RLS + storage (do uruchomienia w Supabase)
design-reference/             oryginalne pliki designu (referencja wizualna)
```

## Uwagi

- Newsletter (formularz zapisu) jest na razie kosmetyczny (front-end only) —
  podłączenie do realnego dostawcy (np. tabeli Supabase lub zewnętrznego ESP)
  to osobny, krótki krok do ustalenia z Zamawiającym.
- Statyczne bloki strony głównej niepowiązane z konkretnym artykułem (pasek
  newsów w hero, „Nadchodzące wydarzenia” w sekcji Sport, galeria „Twarze
  tego tygodnia”) są tłumaczone przez i18n, ale nie mają jeszcze własnego
  CRUD w panelu — zgodnie z umową §1b/§1c panel zarządza artykułami; jeśli
  potrzebny będzie CRUD i dla tych bloków, to naturalne rozszerzenie obecnej
  architektury (kolejna tabela + formularz analogiczny do artykułów).

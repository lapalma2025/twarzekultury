# Podłączenie Supabase — kroki ręczne

Projekt: `kqciwgxvtaeenbjdgprx`  
Klucze są już w `.env.local`.

## 1. Schemat bazy

1. Otwórz: https://supabase.com/dashboard/project/kqciwgxvtaeenbjdgprx/sql/new
2. Wklej **całą** zawartość pliku `schema.sql`
3. Kliknij **Run**

To tworzy: `articles`, `profiles`, `site_settings`, bucket `article-images`, RLS.

## 2. Konto admina (panel: dodawanie / edycja / usuwanie artykułów)

1. Otwórz: https://supabase.com/dashboard/project/kqciwgxvtaeenbjdgprx/auth/users
2. **Add user** → e-mail: `redakcja@twarzekultury.pl` + hasło (wybierz własne)
3. Zaznacz **Auto Confirm User**
4. W SQL Editor uruchom:

```sql
insert into public.profiles (id, email, role)
select id, email, 'admin' from auth.users
where email = 'redakcja@twarzekultury.pl'
on conflict (id) do update set email = excluded.email, role = 'admin';
```

Tylko użytkownicy z wierszem w `public.profiles` mają dostęp do `/admin` i mogą CRUD artykułów.

## 2b. Galeria „Twarze tego tygodnia” (opcjonalnie, jeśli schema był uruchomiony wcześniej)

W SQL Editor wklej też `gallery.sql`, potem w projekcie:

```bash
node scripts/seed-gallery.mjs
```

Panel: `/admin/gallery` — zmiana zdjęć i podpisów.

## 3. Restart aplikacji

```bash
# zatrzymaj i odpal ponownie
npm run dev
```

Zaloguj się w http://localhost:3000/admin/login tym samym e-mailem i hasłem z kroku 2.

Artykuły dodane w panelu trafiają do tabeli `articles` z kategorią (`muzyka` / `film` / `sport` / `gry`) i pojawiają się w odpowiedniej sekcji na stronie.

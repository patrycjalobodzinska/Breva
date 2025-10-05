# Instrukcje Deployu

## Wymagania

- Node.js 18+
- PostgreSQL
- Konto na platformie deployu (Vercel, Netlify, Railway, etc.)

## Zmienne środowiskowe

Skopiuj `env.example` do `.env.local` i uzupełnij wartości:

```bash
cp env.example .env.local
```

### Wymagane zmienne:

- `DATABASE_URL` - URL do bazy danych PostgreSQL
- `NEXTAUTH_URL` - URL aplikacji (localhost dla dev, domena dla prod)
- `NEXTAUTH_SECRET` - Sekretny klucz (wygeneruj: `openssl rand -base64 32`)

### Opcjonalne zmienne:

- `EMAIL_*` - Konfiguracja email
- `NEXT_PUBLIC_*` - Zmienne publiczne
- `OPENAI_API_KEY` - Klucz API OpenAI
- `CLOUDINARY_URL` - Konfiguracja Cloudinary

## Deploy na Vercel

1. Połącz repozytorium z Vercel
2. Dodaj zmienne środowiskowe w dashboard Vercel
3. Ustaw `NEXTAUTH_URL` na domenę produkcyjną
4. Ustaw `DATABASE_URL` na produkcyjną bazę danych

## Deploy na Railway

1. Połącz repozytorium z Railway
2. Dodaj PostgreSQL service
3. Skopiuj `DATABASE_URL` z Railway
4. Dodaj zmienne środowiskowe w Railway dashboard

## Deploy na Netlify

1. Połącz repozytorium z Netlify
2. Ustaw build command: `npm run build`
3. Ustaw publish directory: `.next`
4. Dodaj zmienne środowiskowe w Netlify dashboard

## Baza danych

### Lokalnie:

```bash
npx prisma migrate dev
npx prisma generate
```

### Produkcja:

```bash
npx prisma migrate deploy
npx prisma generate
```

## Build i start

```bash
npm run build
npm start
```

## Troubleshooting

- Sprawdź czy wszystkie zmienne środowiskowe są ustawione
- Sprawdź czy baza danych jest dostępna
- Sprawdź logi aplikacji w dashboard platformy

# BREVA - Precyzyjna analiza objętości piersi

Zaawansowana aplikacja Next.js 14 do analizy asymetrii piersi z wykorzystaniem technologii AI.

## 🚀 Funkcje

- **Analiza AI**: Automatyczna analiza objętości piersi z wideo, zdjęć i danych LiDAR
- **Pomiary ręczne**: Porównanie wyników AI z pomiarami manualnymi
- **Panel użytkownika**: Zarządzanie pomiarami, wykresy, raporty
- **Panel admina**: Zarządzanie użytkownikami i globalne statystyki
- **Bezpieczeństwo**: NextAuth z rolami, szyfrowanie haseł, middleware ochrony

## 🛠 Technologie

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Prisma ORM
- **Baza danych**: PostgreSQL (Vercel Postgres)
- **Autentykacja**: NextAuth.js z JWT
- **AI Backend**: Python FastAPI (mock)
- **Deployment**: Vercel

## 📋 Wymagania

- Node.js 18+
- PostgreSQL (lokalnie lub Vercel Postgres)
- Python 3.8+ (dla AI backend)

## 🚀 Instalacja

### 1. Klonowanie i instalacja zależności

```bash
git clone <repository-url>
cd breva
npm install
```

### 2. Konfiguracja bazy danych

```bash
# Utwórz plik .env.local
cp .env.example .env.local

# Edytuj .env.local i uzupełnij:
DATABASE_URL="postgresql://username:password@localhost:5432/breva"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_EMAIL="admin@breva.vercel.app"
ADMIN_PASSWORD="admin123"
PY_BACKEND_URL="http://localhost:8000"
```

### 3. Migracje i seed

```bash
# Generuj Prisma client
npm run prisma:generate

# Uruchom migracje
npm run prisma:migrate

# Seed admin user
npm run db:seed
```

### 4. Python AI Backend

```bash
# Przejdź do katalogu python-backend
cd python-backend

# Zainstaluj zależności
pip install -r requirements.txt

# Uruchom serwer
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 5. Uruchomienie aplikacji

```bash
# W głównym katalogu
npm run dev
```

Aplikacja będzie dostępna pod adresem `http://localhost:3000`

## 📁 Struktura projektu

```
breva/
├── pages/
│   ├── api/                  # API endpoints
│   ├── panel/                # Panel użytkownika
│   ├── admin/                # Panel administratora
│   ├── logowanie.tsx         # Strona logowania
│   ├── rejestracja.tsx       # Strona rejestracji
│   └── index.tsx             # Strona główna
├── components/
│   ├── ui/                   # Komponenty shadcn/ui
│   ├── PanelLayout.tsx       # Layout panelu użytkownika
│   └── AdminLayout.tsx       # Layout panelu admina
├── src/lib/                  # Utilities, auth, prisma
├── prisma/                   # Schema i migracje
├── python-backend/          # AI backend (FastAPI)
└── public/                  # Statyczne pliki
```

## 🔐 Role i uprawnienia

### Użytkownik (USER)

- Przesyłanie plików do analizy AI
- Przeglądanie swoich pomiarów
- Dodawanie pomiarów ręcznych
- Edycja nazw i notatek
- Zmiana hasła

### Administrator (ADMIN)

- Wszystkie uprawnienia użytkownika
- Lista wszystkich użytkowników
- Szczegóły użytkowników i ich pomiarów
- Zmiana haseł użytkowników
- Globalna lista pomiarów

## 📊 API Endpoints

### Autentykacja

- `POST /api/auth/register` - Rejestracja
- `POST /api/auth/login` - Logowanie (NextAuth)

### Pomiary

- `GET /api/measurements` - Lista pomiarów użytkownika
- `GET /api/measurements/[id]` - Szczegóły pomiaru
- `PUT /api/measurements/[id]` - Aktualizacja pomiaru
- `POST /api/measurements/[id]/manual` - Dodaj pomiar ręczny
- `PUT /api/measurements/manual/[id]` - Edytuj pomiar ręczny

### Upload i AI

- `POST /api/uploads/analyze` - Analiza pliku przez AI

### Admin

- `GET /api/admin/users` - Lista użytkowników
- `GET /api/admin/users/[id]` - Szczegóły użytkownika
- `GET /api/admin/users/[id]/measurements` - Pomiary użytkownika
- `POST /api/admin/users/[id]/password` - Zmiana hasła użytkownika
- `GET /api/admin/measurements` - Globalna lista pomiarów

## 🎨 Paleta kolorów

```css
--primary: #f8c9d3        /* Główny róż */
--primary-dark: #f6a7b7   /* Ciemniejszy róż */
--accent-1: #fdecef       /* Bardzo jasny róż */
--accent-2: #ffe7ea       /* Jasny róż */
--accent-3: #f9e6ea       /* Pastelowy róż */
--accent-4: #fbeef2       /* Subtelny róż */
--text-primary: #1d1b1e   /* Ciemny tekst */
--text-muted: #6a6a6a     /* Szary tekst */
```

## 🚀 Deployment na Vercel

### 1. Przygotowanie

```bash
# Zbuduj aplikację
npm run build

# Sprawdź czy wszystko działa
npm run start
```

### 2. Konfiguracja Vercel

1. Połącz repozytorium z Vercel
2. Dodaj zmienne środowiskowe:
   - `DATABASE_URL` - URL bazy Vercel Postgres
   - `NEXTAUTH_SECRET` - Losowy klucz
   - `NEXTAUTH_URL` - URL aplikacji
   - `ADMIN_EMAIL` - Email admina
   - `ADMIN_PASSWORD` - Hasło admina
   - `PY_BACKEND_URL` - URL Python backend

### 3. Python Backend

Deploy Python backend na Vercel Functions lub osobny serwer.

## 🧪 Testowanie

```bash
# Uruchom testy (jeśli dostępne)
npm test

# Sprawdź linting
npm run lint
```

## 📝 Notatki dla deweloperów

- Wszystkie teksty w języku polskim
- Używa NextAuth z JWT strategy
- Pliki są walidowane pod kątem typu i rozmiaru
- AI backend to mock - w produkcji zastąpić prawdziwymi modelami ML
- Wszystkie API endpoints mają walidację Zod
- Middleware chroni routes na podstawie ról

## 🤝 Wkład w rozwój

1. Fork projektu
2. Utwórz branch (`git checkout -b feature/amazing-feature`)
3. Commit zmian (`git commit -m 'Add amazing feature'`)
4. Push do branch (`git push origin feature/amazing-feature`)
5. Otwórz Pull Request

## 📄 Licencja

Ten projekt jest własnością BREVA. Wszystkie prawa zastrzeżone.

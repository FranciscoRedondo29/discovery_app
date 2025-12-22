## Discovery MVP

An AI reading companion for dyslexic students, built with Next.js (App Router), Tailwind CSS, shadcn/ui, and Supabase authentication.

### Tech stack

- **Framework**: Next.js 14 (App Router)
- **UI**: React 18, TypeScript, Tailwind CSS, shadcn/ui (Radix primitives)
- **Auth + DB**: Supabase (`@supabase/supabase-js`)
- **Icons**: Lucide

### Features and routes

- **Landing page**: `/`
- **Register (choose profile type)**: `/register`
- **Register form**: `/register/aluno`, `/register/profissional`
- **Login**: `/login`
  - Shows a success banner when arriving from registration via `?registered=true`
  - Redirects to `/aluno` or `/profissional` depending on the user profile table
- **Aluno dashboard**: `/aluno` (requires an authenticated user present in the `alunos` table)
- **Profissional dashboard**: `/profissional` (requires an authenticated user present in the `profissionais` table)

### Getting started

#### Prerequisites

- Node.js **18+**
- npm **9+** (or a compatible npm version bundled with Node 18+)

#### Install

```bash
npm install
```

#### Run locally

```bash
npm run dev
```

Open `http://localhost:3000`.

#### Scripts

```bash
npm run dev
npm run build
npm start
npm run lint
```

### Environment variables

Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
```

Notes:
- These values come from Supabase: Project Settings → API.
- Do not commit `.env.local`.

### Supabase setup (database + RLS)

1. Create a Supabase project.
2. Open Supabase Dashboard → SQL Editor.
3. Run the SQL in `supabase-schema.sql`.

This sets up:
- Tables: `alunos`, `profissionais`
- Constraints (including `ano_escolaridade` range and `funcao` allowed values)
- Row Level Security (RLS) + policies so a user can insert/select/update their own row
- Indexes on email columns
- A migration section for adding `nome`/`funcao` if your tables already existed

### Authentication flow (high-level)

- **Register**:
  - Creates a user with `supabase.auth.signUp()`
  - Inserts profile data into either `alunos` or `profissionais`
  - Redirects to `/login?registered=true` so the login page can show a success banner
- **Login**:
  - Signs in with `supabase.auth.signInWithPassword()`
  - Determines the role by checking whether the user exists in `alunos` or `profissionais`
  - Redirects to `/aluno` or `/profissional`
- **Route protection**:
  - `/aluno` and `/profissional` re-check the session and validate membership in the correct table to prevent direct URL access by unauthorized users

Implementation note:
- The `/login` route is wrapped in a React `<Suspense>` boundary because it uses `useSearchParams()` (required by Next.js App Router for build/prerender compatibility).

### Design system

#### Color palette

- **Primary Yellow**: `#EAB308` (CTAs and interactive elements)
- **Soft Yellow**: `#FEFCE8` (section backgrounds, subtle highlights)
- **Text Primary**: `#1C1917` (warm charcoal; avoid pure black)

#### Typography and accessibility

- Font: Inter (via Next.js font setup)
- Target: WCAG 2.1 AA friendly contrast and keyboard navigation

### Project structure (simplified)

```
app/
  page.tsx                      # landing
  login/
    page.tsx                    # Suspense wrapper
    LoginClient.tsx             # login client component
  register/
    page.tsx                    # profile type selection
    [profileType]/page.tsx      # aluno/profissional registration form
  aluno/page.tsx                # aluno dashboard (guarded)
  profissional/page.tsx         # profissional dashboard (guarded)
components/ui/                  # shadcn/ui components + Navbar
hooks/
lib/
supabase-schema.sql
```

### Troubleshooting

- **`npm install` fails**:

```bash
npm cache clean --force
npm install
```

- **Port 3000 already in use**:

```bash
npm run dev -- -p 3001
```

- **Styles not loading / weird UI after changes**:

```bash
rm -rf .next
npm run dev
```

- **TypeScript/build issues**:
  - Re-run `npm run build` and read the first TypeScript error.
  - If you recently moved files, confirm imports still match your folder structure.

### Optional docs

The repository includes additional notes (some content overlaps with this README):
- `QUICK_START.md`
- `SETUP.md`
- `AUTH_IMPLEMENTATION.md`
- `REGISTRATION_SUMMARY.md`
- `VERIFICATION_CHECKLIST.md`
- `PROJECT_SUMMARY.md`

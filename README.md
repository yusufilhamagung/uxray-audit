# UXAudit AI

Audit UI/UX dari screenshot dengan AI. MVP ini terdiri dari Next.js App Router, API backend, Supabase (DB + Storage), engine audit AI dengan mock fallback, dan export report JSON/HTML.

## Features
- Landing page dengan CTA ke audit flow
- Upload screenshot PNG/JPG (max 5MB) + pilih tipe halaman
- AI audit dengan output JSON terstruktur dan validasi Zod
- Simpan hasil ke Supabase Postgres + upload image ke Supabase Storage
- Download report JSON dan HTML
- Rate limit sederhana (20 request per jam per IP)

## Tech Stack
- Next.js 14 (App Router) + TypeScript
- TailwindCSS
- Zod
- Supabase (Storage + Postgres)

## Project Structure
- `app/` routes, pages, API handlers
- `components/` UI components
- `lib/` schema, AI logic, helpers
- `server/` server-side services (audit workflow)
- `fixtures/` mock audit JSON
- `supabase/migrations/` SQL migration
- `scripts/` simple validation script

## Environment Variables
Copy `.env.example` -> `.env.local` and fill:

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: service role key (server only)
- `SUPABASE_STORAGE_BUCKET`: bucket name (default `ux-audit`)
- `AI_API_URL`: AI HTTP endpoint
- `AI_API_KEY`: AI API key
- `AI_MODEL`: model id string
- `AI_MOCK_MODE`: `true` to return deterministic mock result

## Supabase Setup
1. Create a Supabase project.
2. Create a Storage bucket named `ux-audit`.
3. Make the bucket public OR add a read policy so the image URL can be opened.
4. Run SQL migration from `supabase/migrations/001_create_audits.sql` in the SQL editor.

## Local Run
Windows (PowerShell):
```powershell
cd "c:\users\uxray-audit"
npm install
Copy-Item .env.example .env.local
npm run dev
```

Mac/Linux (bash):
```bash
cd "/path/to/users/uxray-audit"
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## API Endpoints
- `POST /api/audit`
  - multipart form-data:
    - `image` (PNG/JPG)
    - `page_type` (Landing | App | Dashboard)
    - `optional_context` (optional string)
- `GET /api/audit/:id`
  - JSON response of stored audit
  - Add `?download=1` to force download
- `GET /api/audit/:id/report`
  - HTML report download

## AI Audit Notes
- Prompt forces JSON output with strict schema.
- If AI returns invalid JSON, fallback to mock result and mark `model_used` as `mock_fallback`.
- AI timeout is 30s.

## Storage Upload Path
- Images are stored at: `audits/yyyy-mm-dd/uuid.png` (or `.jpg`)

## Scripts
- `npm run validate:mock` validates `fixtures/mock-audit.json` against the Zod schema.

## Troubleshooting
- 401/403 from Supabase: check keys and bucket permissions.
- Storage upload failure: confirm bucket name and `SUPABASE_SERVICE_ROLE_KEY`.
- CORS error: add `http://localhost:3000` to Supabase CORS settings.
- AI JSON parse error: set `AI_MOCK_MODE=true` or validate AI response format.
- Zod validation error: AI output does not match schema.

## Security Notes
- Never expose `SUPABASE_SERVICE_ROLE_KEY` in client code.
- This MVP has no auth and is intended for local/dev use only.

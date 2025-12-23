# Production Hardening Checklist

## Environment Variables (Detected)

Client/public:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET
- NEXT_PUBLIC_BRAND_LOGO_PATH

Server:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- SUPABASE_STORAGE_BUCKET
- GEMINI_API_KEY
- GEMINI_URL
- GEMINI_MODEL
- AI_API_KEY
- AI_API_URL
- AI_MODEL
- AI_MOCK_MODE
- PUPPETEER_EXECUTABLE_PATH

## Production Error Checklist

1) npm ci warnings
- Error/Warning: Deprecated packages + 3 high severity vulnerabilities reported by npm audit.
- File/Line: N/A (dependency tree).
- Root cause hypothesis: Upstream dependencies pinned to older versions.
- Fix applied: None (not production-blocking; requires dependency upgrade plan).
- Verification: `npm.cmd ci` (warnings remain; install succeeds).

## Verification Log

- `npm.cmd run lint` -> PASS (no ESLint warnings or errors).
- `npm.cmd run build` -> PASS.
- `npm.cmd run start` -> PASS (server started).
- `npm.cmd run test:runtime` -> PASS (/, /audit, /pricing, /api/audit/url, /api/audit).
- `PUPPETEER_EXECUTABLE_PATH="C:\Program Files\Google\Chrome\Application\chrome.exe" npm.cmd run test:puppeteer` -> PASS.

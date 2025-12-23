# Production Hardening Notes

## Vercel Runtime Error: Missing `@sparticuz/chromium/bin`

- Error: `The input directory "/var/task/node_modules/@sparticuz/chromium/bin" does not exist.`
- Root cause: Output file tracing omitted `@sparticuz/chromium/bin`, so Chromium assets were not packaged into the serverless function.
- Fix: 
  - Use a centralized Chromium launcher that calls `chromium.executablePath()` (no hardcoded `/var/task` or `.next` paths).
  - Add output file tracing includes to bundle `node_modules/@sparticuz/chromium/bin/**` for the audit routes.
  - Add Node.js runtime guard + remote-worker fallback when Chromium is unavailable.
- Files: `src/server/chromium/launch.ts`, `src/app/api/audit/url/route.ts`, `next.config.mjs`.
- Verification: `npm.cmd run build`, `npm.cmd run start`, `npm.cmd run test:runtime`.

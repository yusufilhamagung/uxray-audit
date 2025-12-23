const BASE_URL = process.env.UX_SMOKE_BASE_URL || 'http://localhost:3000';
const TARGET_URL = process.env.UX_SMOKE_TARGET_URL;
const PAGE_TYPE = process.env.UX_SMOKE_PAGE_TYPE || 'Landing';

if (!TARGET_URL) {
  console.error('UX_SMOKE_TARGET_URL is required to run this smoke test.');
  process.exit(1);
}

const payload = {
  url: TARGET_URL,
  page_type: PAGE_TYPE,
  optional_context: 'Smoke test from scripts/smoke-ux-analysis.mjs'
};

async function run() {
  const response = await fetch(`${BASE_URL}/api/audit/url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Smoke UX analysis failed: ${response.status} ${text}`);
  }

  const data = await response.json().catch(() => null);
  console.log('Smoke UX analysis succeeded:', data?.data?.audit_id ?? 'unknown');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});

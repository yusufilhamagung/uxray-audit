const endpoint = process.env.EARLY_ACCESS_URL || 'http://localhost:3000/api/early-access';
const email =
  process.env.EARLY_ACCESS_EMAIL || `early-access+${Date.now()}@example.com`;
const auditId = process.env.EARLY_ACCESS_AUDIT_ID;

async function postOnce(label: string) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      source: 'local-script',
      audit_id: auditId || undefined
    })
  });

  const data = await response.json().catch(() => null);
  console.log(`${label}:`, response.status, data);
}

async function run() {
  console.log(`Testing early access dedupe with email: ${email}`);
  await postOnce('Attempt 1');
  await postOnce('Attempt 2');
}

run().catch((error) => {
  console.error('Early access test failed:', error);
  process.exit(1);
});

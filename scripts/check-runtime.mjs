const BASE_URL = process.env.RUNTIME_BASE_URL || 'http://localhost:3000';
const TIMEOUT_MS = 8000;

const endpoints = [
  { name: 'home', method: 'GET', path: '/', expect: [200] },
  { name: 'audit', method: 'GET', path: '/audit', expect: [200] },
  { name: 'pricing', method: 'GET', path: '/pricing', expect: [200] },
  {
    name: 'audit-url-invalid',
    method: 'POST',
    path: '/api/audit/url',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
    expect: [400, 429]
  },
  {
    name: 'audit-image-invalid',
    method: 'POST',
    path: '/api/audit',
    body: new FormData(),
    expect: [400, 429]
  }
];

async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function checkEndpoint(endpoint) {
  const url = `${BASE_URL}${endpoint.path}`;
  const response = await fetchWithTimeout(url, {
    method: endpoint.method,
    headers: endpoint.headers,
    body: endpoint.body
  });
  const ok = endpoint.expect.includes(response.status);
  if (!ok) {
    const text = await response.text().catch(() => '');
    throw new Error(
      `${endpoint.name} failed: ${endpoint.method} ${endpoint.path} returned ${response.status}. ${text}`
    );
  }
  console.log(`[OK] ${endpoint.name}: ${response.status}`);
}

async function waitForServer() {
  const start = Date.now();
  while (Date.now() - start < TIMEOUT_MS) {
    try {
      const response = await fetchWithTimeout(`${BASE_URL}/`, { method: 'GET' });
      if (response.ok) {
        return;
      }
    } catch {
      // Keep retrying until timeout.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error('Server did not respond in time.');
}

async function run() {
  await waitForServer();
  for (const endpoint of endpoints) {
    await checkEndpoint(endpoint);
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});

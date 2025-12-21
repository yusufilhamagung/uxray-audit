import { readFileSync } from 'node:fs';
import { AuditResultSchema } from '../lib/schema';

const raw = readFileSync(new URL('../fixtures/mock-audit.json', import.meta.url), 'utf-8');
const data = JSON.parse(raw);

const parsed = AuditResultSchema.safeParse(data);

if (!parsed.success) {
  console.error('Mock audit JSON is invalid.');
  console.error(parsed.error.format());
  process.exit(1);
}

console.log('Mock audit JSON is valid.');

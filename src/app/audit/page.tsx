import { Suspense } from 'react';
import AuditPageClient from './AuditPageClient';

export default function AuditPage() {
  return (
    <Suspense fallback={null}>
      <AuditPageClient />
    </Suspense>
  );
}

import UnlockPageClient from './UnlockPageClient';

type UnlockPageProps = {
  searchParams?: {
    auditId?: string;
  };
};

export default function UnlockPage({ searchParams }: UnlockPageProps) {
  const auditId = typeof searchParams?.auditId === 'string' ? searchParams.auditId : undefined;
  return <UnlockPageClient auditId={auditId} />;
}

import { headers } from 'next/headers';

export function getRequestIp() {
  const headerList = headers();
  return (
    headerList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headerList.get('x-real-ip') ||
    'local'
  );
}

export function getRequestUserAgent() {
  return headers().get('user-agent') || undefined;
}

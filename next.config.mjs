/** @type {import('next').NextConfig} */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const remotePatterns = [];

if (supabaseUrl) {
  try {
    const parsed = new URL(supabaseUrl);
    remotePatterns.push({
      protocol: parsed.protocol.replace(':', ''),
      hostname: parsed.hostname,
      pathname: '/storage/v1/object/public/**'
    });
  } catch (error) {
    console.warn('Invalid NEXT_PUBLIC_SUPABASE_URL for image config.', error);
  }
}

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns
  }
};

export default nextConfig;

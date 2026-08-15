const DEFAULT_TYPEWRITER_API_BASE = 'https://api.ambrecht.de';

export function getPublicTypewriterApiBase() {
  return (
    process.env.NEXT_PUBLIC_TYPEWRITER_API_BASE ||
    process.env.NEXT_PUBLIC_TYPEWRITER_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    DEFAULT_TYPEWRITER_API_BASE
  );
}

export function buildTypewriterApiUrl(path: string, query?: URLSearchParams) {
  const base = new URL(getPublicTypewriterApiBase());
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const withoutApiPrefix = normalizedPath.replace(/^\/api\/v1(?=\/|$)/, '');
  const basePath = base.pathname.replace(/\/$/, '');
  const nextPath = basePath.endsWith('/api/v1')
    ? `${basePath}${withoutApiPrefix}`
    : `${basePath}/api/v1${withoutApiPrefix}`;

  base.pathname = nextPath.replace(/\/{2,}/g, '/');
  base.search = query?.toString() ?? '';

  return base.toString();
}

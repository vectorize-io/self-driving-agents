/**
 * Build an href for internal navigation through `<Link>`.
 *
 * Next.js's `<Link>` already prepends the configured `basePath` to root-
 * relative hrefs, so this helper must NOT add it again — otherwise we get
 * `/<base>/<base>/path`. The function exists only to normalise inputs to a
 * leading-slash form and to keep call sites uniform.
 */
export function link(path: string): string {
  return path.startsWith('/') ? path : `/${path}`;
}

/**
 * Build a URL for static assets under /public.
 *
 * Plain `<img src>`, `<link rel="icon">`, and other raw HTML attributes do
 * NOT get basePath prepended by Next.js. We have to do it ourselves.
 */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

export function asset(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${BASE}${p}`;
}

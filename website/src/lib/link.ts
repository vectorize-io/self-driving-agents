/**
 * Build an internal link with the configured base path.
 *
 * Next.js `<Link href="/foo">` does NOT prepend basePath when href starts
 * with a slash AND we're using `output: 'export'`. To keep static asset
 * paths and anchor hrefs consistent we apply the base manually.
 */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

export function link(path: string): string {
  if (!path.startsWith('/')) return `${BASE}/${path}`;
  return `${BASE}${path}`;
}

/**
 * Build an asset URL under /public — used for logos and favicons since
 * `<img src>` does not pick up basePath automatically with `output: 'export'`.
 */
export function asset(path: string): string {
  return link(path.startsWith('/') ? path : `/${path}`);
}

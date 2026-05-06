/** @type {import('next').NextConfig} */

// Static export so the site can deploy to GitHub Pages, S3, Vercel, anywhere.
// basePath is empty by default for `npm run dev` and Vercel; set
// SITE_BASE=/self-driving-agents in CI for GitHub Pages.
const SITE_BASE = process.env.SITE_BASE || '';

const nextConfig = {
  output: 'export',
  basePath: SITE_BASE || undefined,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: SITE_BASE,
  },
};

export default nextConfig;

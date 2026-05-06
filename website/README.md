# Self-Driving Agents — docs site

Static documentation site for [self-driving-agents](https://github.com/vectorize-io/self-driving-agents). Built with [Next.js 15](https://nextjs.org) (App Router, static export) and [Tailwind CSS v4](https://tailwindcss.com), deployed to GitHub Pages.

## Local development

```bash
cd website
npm install
npm run dev
```

The site is served at <http://localhost:4321>. Top-level template directories at the repo root (e.g. `marketing/`) are read at build time, so any change to a `bank-template.json` or `.md` file under them shows up on a refresh.

## Build

```bash
npm run build
```

The static output goes to `website/out/`. Both `dev` and `build` pin `NODE_ENV` themselves, so your shell setting doesn't matter.

## Deployment

### GitHub Pages (current)

Pushed automatically on every push to `main` that touches `website/**` or any top-level template dir. See [.github/workflows/pages.yml](../.github/workflows/pages.yml). The workflow sets `SITE_BASE=/self-driving-agents` so links/assets resolve under <https://vectorize-io.github.io/self-driving-agents/>.

### Vercel / other static hosts

`npm run build` produces a plain static `out/` directory — drop it on any host. For Vercel, just connect the repo: it auto-detects Next.js and serves the static export.

For a deployment without a base path (e.g. a dedicated domain or Vercel preview), leave `SITE_BASE` unset.

## Structure

```
website/
  src/
    app/                          # App Router pages
      page.tsx                    # /
      not-found.tsx               # 404
      layout.tsx                  # root layout
      globals.css                 # Tailwind + theme tokens
      concepts/page.tsx           # /concepts
      quickstart/page.tsx         # /quickstart
      agents/page.tsx             # /agents (lists top-level + search)
      agents/[...slug]/page.tsx   # /agents/marketing, /agents/marketing/seo, ...
      harnesses/page.tsx          # /harnesses
      harnesses/[slug]/page.tsx   # /harnesses/claude-code, /claude, ...
    components/
      Header.tsx, Footer.tsx
      AgentCard.tsx, AgentSearch.tsx (client)
      CodeBlock.tsx, HarnessLogo.tsx
      Mermaid.tsx (client — dynamic import of mermaid)
    lib/
      agents.ts                   # walks ../<top-level>/ at build time
      harnesses.ts                # static harness metadata
      link.ts                     # base-path-aware link helper
  public/
    favicon.svg
    logos/                        # claude.svg, nvidia.svg, openclaw.svg, ...
  next.config.mjs
  postcss.config.mjs
```

## Adding a new harness

Edit `src/lib/harnesses.ts` and add a new entry to `HARNESSES`. The page at `/harnesses/<slug>` is generated automatically.

## Adding new agents

Drop a new directory at the repo root (or under any existing template root) with a `bank-template.json`. The loader auto-discovers any top-level directory with that file, so a new `engineering/` department appears on the next push to `main` with no code changes here.

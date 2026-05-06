# Self-Driving Agents — docs site

Static documentation site for [self-driving-agents](https://github.com/vectorize-io/self-driving-agents). Built with [Astro](https://astro.build) and [Tailwind CSS](https://tailwindcss.com), deployed to GitHub Pages.

## Local development

```bash
cd website
npm install
npm run dev
```

Site is served at <http://localhost:4321>. The `marketing/` folder is read at build time, so any change to a `bank-template.json` or `.md` file under it shows up on a refresh.

## Build

```bash
npm run build
npm run preview
```

The output goes to `website/dist`.

## Deployment

Pushed automatically to GitHub Pages on every push to `main` that touches `website/**` or `marketing/**` (see [.github/workflows/pages.yml](../.github/workflows/pages.yml)).

The base path is `/self-driving-agents` to match the GitHub Pages URL `https://vectorize-io.github.io/self-driving-agents/`. Override via `SITE_URL` and `SITE_BASE` env vars when building locally.

## Structure

```
website/
  src/
    components/      # Header, Footer, AgentCard, CodeBlock
    layouts/         # Layout.astro
    lib/             # agents.ts (reads ../marketing), harnesses.ts
    pages/
      index.astro                  # landing
      quickstart.astro             # /quickstart
      agents/index.astro           # /agents
      agents/[...slug].astro       # /agents/marketing, /agents/marketing/seo, ...
      harnesses/index.astro        # /harnesses
      harnesses/[slug].astro       # /harnesses/claude, ...
    styles/global.css              # Tailwind + theme tokens
  public/favicon.svg
  astro.config.mjs
```

## Adding a new harness

Edit `src/lib/harnesses.ts` and add a new entry to `HARNESSES`. The page at `/harnesses/<slug>` is generated automatically.

## Adding new agents

Drop a new directory under `marketing/` (or any sibling templates dir you wire up in `src/lib/agents.ts`). Each directory with a `bank-template.json` becomes an agent page; `.md` files in that directory are listed as its knowledge files.

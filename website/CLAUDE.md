# Docs site — orientation for future work

This site (`website/`) is the public face of **self-driving-agents**, not a Hindsight marketing surface. Future contributors (and Claude) should write copy from the user's POV — what the user's agents gain — and only surface the wiring in the right place.

## Positioning

- The site sells **self-driving agents**: agents that learn from every conversation and get better over time. The home page tagline is the source of truth: *"Agents that learn from every conversation and get better over time."* Mirror that framing — learning, getting better, walking in already informed.
- Hindsight is the memory backend that makes this work, but it's an implementation detail at the surface level. Don't lead with "memory" or "Hindsight plugin"; lead with what the user's agent now does.
- Each harness page sells **how that runtime gains self-driving agents** — not how a plugin or MCP server works.

## Per-harness page structure

Every harness page (`/harnesses/<slug>`) follows the same three-section shape, driven by the `Harness` type in `src/lib/harnesses.ts` (new shape uses `whatYouGet` + `tools`):

1. **What you get** — pure user value. What does adding self-driving agents to *this harness* enable for the user? Prose intro + 3-ish bullet points. Bold lead phrases via markdown (`**…**`). **No** plugin names, version numbers, file paths, hook names, or tool signatures here.
2. **Setup** — the install steps. Concrete commands. Step bodies should describe what the user does and what happens at a high level — not the internal mechanics. Code blocks for actual commands.
3. **How it works** — every technical detail goes here. Plugin name and version, install paths, hook semantics, tunable config keys, tools the agent can call (rendered from `tools[]` as a grid), bank-mapping callout.

**The dividing line:** if a sentence mentions a plugin/MCP/skill name, a Hindsight config key, a hook, a tool, or a file path — it belongs in *How it works*. If it describes a behavior the user observes — *What you get*. If it's a command the user types — *Setup*.

## Copy conventions

- **Markdown-style inline formatting:** content strings render through `<Inline>` (`src/components/Inline.tsx`) which converts `` `code` `` → `<code>` and `**bold**` → `<strong>`. Keep markdown out of the source data structure beyond those two markers.
- **Tools:** each migrated harness exposes its agent-facing tools via the `tools: { name; description }[]` field. The page renders this as a 2-column grid in *How it works*. Tool names are the actual names the agent calls (no prefixes like `mcp__plugin_…__`).
- **Bank mapping:** lives as a callout at the bottom of *How it works*. Summary + details bullets. State the actual derivation (e.g. "bank id = agent name") not a generic claim.
- **Brevity:** error on the side of fewer, denser bullets. The user has called out density problems repeatedly. Aim for 3 items per list, never more than 5.

## Style

- **No `border-l-4` callouts.** The user has explicitly forbidden this style. Use full-perimeter `ring-1 ring-inset ring-<color>-200` on a tinted `bg-<color>-50/60` instead. See the bank-mapping callout in `src/app/harnesses/[slug]/page.tsx`.
- **No emojis** unless the user explicitly asks.
- **Tone:** concrete, no marketing slop. Replace adjectives with facts. "Long-form playbooks the agent maintains" beats "powerful AI-driven knowledge management".

## Fact-checking before edits

Each harness's *How it works* and *Setup* sections must match the actual CLI behavior in `src/cli.ts` and the latest plugin/integration code in the Hindsight repo. Before editing a harness page:

1. Read the corresponding branch in `src/cli.ts` (`harness === "<slug>"` plus any helper it calls — `ensurePlugin`, `ensureOpenClawAgentGranularity`, `ensureNemoClawPlugin`, `ensureHermesPlugin`).
2. Read the integration's README / source under `/Users/nicoloboschi/dev/memory-poc/hindsight-integrations/<harness>/` (or the latest in the `vectorize-io/hindsight` repo).
3. Cross-check: plugin npm slug, file paths, config keys, default values, tool list, and bank derivation.

Don't paraphrase from memory — go to the source.

## Sections explicitly removed from `/concept`

These were dropped because they were Hindsight-internal noise that the user's agent author doesn't need:

- "What lives where"
- "Bank-level missions"
- "Talking to a bank"
- "A mental model in detail"

Don't add them back. The concept page leads with the architectural diagram, then *Two primitives*, *What the agent can call* (caveated that exact tool surface depends on the harness), *Why this split exists*, and *From here*.

## Links

Internal navigation goes through the `link()` helper in `src/lib/link.ts` — which is now a no-op so Next.js's `<Link>` can prepend `basePath` itself. Static asset URLs (`<img src>`, favicon) go through `asset()` which **does** prepend `basePath`. Mixing the two is what produced `/self-driving-agents/self-driving-agents/...` URLs in an earlier deploy.

## Build pitfalls

- The user's shell has `NODE_ENV=development`. The `dev`/`build`/`start` npm scripts pin `NODE_ENV` themselves; don't rely on the environment.
- Renaming a route folder (`concepts/` → `concept/`, `quickstart/` → `create/`) requires a dev-server bounce because Next's HMR misses new route folders.
- `rm -rf .next` while the dev server is running breaks it. Stop dev first, *then* clean, *then* restart.

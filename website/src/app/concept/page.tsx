import type { Metadata } from 'next';
import Link from 'next/link';
import { Mermaid } from '@/components/Mermaid';
import { link } from '@/lib/link';

export const metadata: Metadata = {
  title: 'Concept',
  description:
    'How a harness works with memory: the agent reads knowledge pages on demand and retains memories during the chat; Hindsight rewrites the pages in the background.',
};

// Architectural view, not a flow. Nested subgraphs convey containment:
//   Hindsight ⊃ { Bank ⊃ {Pages, Memories}, Refresh engine }
// The bank is a clear data unit; the refresh engine is a separate service
// that operates on it. Dotted arrows = the server-side loop the agent never
// sees.
const ARCHITECTURE = `
flowchart LR
    User((You)):::user

    subgraph harnessBox["Harness — where you chat"]
        Agent["Agent runtime"]:::agent
    end

    subgraph hsBox["Hindsight — server-side memory"]
        direction TB
        subgraph bankBox["Per-agent bank"]
            direction LR
            Memories["Memories<br/>typed facts<br/>append-only history"]:::hs
            Pages["Knowledge pages<br/>read on demand"]:::hs
        end
        Refresh["Refresh engine<br/>regenerates pages from memories"]:::engine
        Memories -.->|consolidate| Refresh
        Refresh -.->|regenerate| Pages
    end

    User <-->|chat| Agent
    Agent -->|read pages| Pages
    Agent -->|retain| Memories

    classDef user fill:#ffffff,stroke:#0d0d10,color:#0d0d10,stroke-width:2px
    classDef agent fill:#d9e6ff,stroke:#3a5ef0,color:#0d0d10,stroke-width:2px
    classDef hs fill:#dcfce7,stroke:#059669,color:#0d0d10
    classDef engine fill:#fef3c7,stroke:#d97706,color:#0d0d10,stroke-width:2px
`.trim();

export default function ConceptPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-ink-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <p className="text-sm font-medium uppercase tracking-wide text-accent-600">
            Concept
          </p>
          <h1 className="mt-2 text-3xl font-bold text-ink-900 sm:text-4xl">
            How the harness works with memory
          </h1>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-ink-500">
            The agent does two things with memory: it{' '}
            <strong className="text-ink-900">reads pages on demand</strong>{' '}
            when it needs context, and{' '}
            <strong className="text-ink-900">retains memories</strong> as the
            chat happens. Pages are rewritten from those memories in the
            background by{' '}
            <a
              className="text-accent-600 hover:underline"
              href="https://github.com/vectorize-io/hindsight"
              target="_blank"
              rel="noopener"
            >
              Hindsight
            </a>
            {' '}— the agent never has to.
          </p>
        </div>
      </section>

      {/* Architecture diagram — leads the page */}
      <section className="border-b border-ink-200 bg-ink-50">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <h2 className="text-2xl font-semibold text-ink-900">Architecture</h2>
          <p className="mt-2 max-w-3xl text-ink-600">
            The agent only crosses the boundary into Hindsight to read pages
            and retain memories. Everything else — consolidating memories into
            facts, regenerating pages — happens server-side.
          </p>

          <div className="mt-8 overflow-x-auto rounded-2xl border border-ink-200 bg-white p-4 sm:p-6">
            <Mermaid id="architecture" chart={ARCHITECTURE} />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-ink-200 bg-white p-3 text-sm">
              <div className="font-semibold text-ink-900">You ↔ Agent</div>
              <p className="mt-1 text-ink-600">
                A normal conversation. The harness (Claude Code, Hermes,
                OpenClaw, NemoClaw…) is the runtime where the agent runs.
              </p>
            </div>
            <div className="rounded-lg border border-ink-200 bg-white p-3 text-sm">
              <div className="font-semibold text-ink-900">Agent ↔ Hindsight</div>
              <p className="mt-1 text-ink-600">
                Two operations only — read knowledge pages, retain memories.
                Wired through MCP, a plugin, or a baked skill depending on the
                harness.
              </p>
            </div>
            <div className="rounded-lg border border-ink-200 bg-white p-3 text-sm">
              <div className="font-semibold text-ink-900">Inside Hindsight</div>
              <p className="mt-1 text-ink-600">
                Memories get consolidated into facts; the refresh engine
                rewrites the agent's pages from those facts. The dashed arrows
                in the diagram are this loop.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Two primitives */}
      <section className="border-b border-ink-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <h2 className="text-2xl font-semibold text-ink-900">Two primitives</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-ink-200 bg-ink-50 p-5">
              <h3 className="text-lg font-semibold text-ink-900">Memories</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-700">
                Atomic, typed facts retained from conversations or ingested
                documents. Append-only — they preserve the full history of
                what the agent has seen.
              </p>
            </div>

            <div className="rounded-xl border border-ink-200 bg-ink-50 p-5">
              <h3 className="text-lg font-semibold text-ink-900">
                Knowledge pages
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-700">
                Long-form markdown documents the agent fetches on demand when
                it needs context. Mutable — Hindsight rewrites them in the
                background as new memories arrive.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tools the agent gets */}
      <section className="border-b border-ink-200 bg-ink-50">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <h2 className="text-2xl font-semibold text-ink-900">
            What the agent can call
          </h2>
          <p className="mt-2 max-w-3xl text-ink-600">
            The capabilities below are common to every harness, but the{' '}
            <strong className="text-ink-900">
              exact tool names, signatures, and what&apos;s actually wired up depend on the harness
            </strong>.
            The names shown are the Claude Code MCP tools (the most complete
            surface today); other harnesses expose the same families with
            different names — and may not implement every one. See the{' '}
            <Link
              href={link('/harnesses')}
              className="text-accent-700 underline-offset-2 hover:underline"
            >
              harness pages
            </Link>{' '}
            for the canonical list per integration.
          </p>

          <aside className="mt-6 rounded-xl bg-emerald-50/70 p-5 ring-1 ring-inset ring-emerald-200">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-800">
              The conversation is retained automatically
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-700">
              The agent doesn't have a{' '}
              <code className="rounded bg-white/80 px-1 py-0.5">retain</code>{' '}
              tool — the harness streams the conversation into Hindsight as
              memories on its own. Anything you say, anything the agent
              decides, anything you correct: it all lands in the bank without
              the agent having to remember to write it down.
            </p>
          </aside>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-ink-200 bg-white p-5">
              <h3 className="text-base font-semibold text-ink-900">Read</h3>
              <p className="mt-1 text-xs uppercase tracking-wide text-ink-400">
                Pull context into the conversation.
              </p>
              <ul className="mt-3 space-y-1.5 text-sm text-ink-700">
                <li>
                  <code className="rounded bg-ink-100 px-1 py-0.5">list_pages</code>{' '}
                  — page ids and names in this bank
                </li>
                <li>
                  <code className="rounded bg-ink-100 px-1 py-0.5">get_page</code>{' '}
                  — read the full content of a page
                </li>
                <li>
                  <code className="rounded bg-ink-100 px-1 py-0.5">recall</code>{' '}
                  — semantic search across retained memories
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-ink-200 bg-white p-5">
              <h3 className="text-base font-semibold text-ink-900">
                Define page recipes
              </h3>
              <p className="mt-1 text-xs uppercase tracking-wide text-ink-400">
                The agent sets what a page tracks — never its body.
              </p>
              <ul className="mt-3 space-y-1.5 text-sm text-ink-700">
                <li>
                  <code className="rounded bg-ink-100 px-1 py-0.5">create_page</code>
                  <span className="ml-1 text-ink-500">
                    (id, name, source_query)
                  </span>
                  {' '}— declare a new page; Hindsight populates the body.
                </li>
                <li>
                  <code className="rounded bg-ink-100 px-1 py-0.5">update_page</code>
                  <span className="ml-1 text-ink-500">
                    (id, name?, source_query?)
                  </span>
                  {' '}— change what a page tracks. Body stays managed by
                  Hindsight.
                </li>
                <li>
                  <code className="rounded bg-ink-100 px-1 py-0.5">delete_page</code>{' '}
                  — remove a page
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-ink-200 bg-white p-5">
              <h3 className="text-base font-semibold text-ink-900">
                Bring in new content
              </h3>
              <p className="mt-1 text-xs uppercase tracking-wide text-ink-400">
                Beyond what's already in the chat.
              </p>
              <ul className="mt-3 space-y-1.5 text-sm text-ink-700">
                <li>
                  <code className="rounded bg-ink-100 px-1 py-0.5">ingest</code>
                  <span className="ml-1 text-ink-500">(title, content)</span>
                  {' '}— add raw text as a memory.
                </li>
                <li>
                  <code className="rounded bg-ink-100 px-1 py-0.5">ingest_file</code>
                  <span className="ml-1 text-ink-500">(file_path)</span>
                  {' '}— read a local file and ingest it server-side.
                </li>
                <li className="text-ink-500">
                  Combined with the harness's web-fetch tool, the agent can
                  also pull in arbitrary URLs the user points at.
                </li>
              </ul>
            </div>
          </div>

          <aside className="mt-8 rounded-xl bg-accent-50/60 p-5 ring-1 ring-inset ring-accent-200">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-accent-800">
              Why each harness has its own integration
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-700">
              The harnesses differ a lot internally — Claude.ai uploads
              skills with no auto-hooks, Claude Code talks to MCP servers,
              OpenClaw and NemoClaw run plugins inside their gateways, Hermes
              loads plugins per profile. Rather than ship one
              lowest-common-denominator bridge, we wrote a dedicated
              integration for each runtime so the same tool surface lands
              natively in each one. See the{' '}
              <Link
                href={link('/harnesses')}
                className="text-accent-700 underline-offset-2 hover:underline"
              >
                harness pages
              </Link>{' '}
              for what that looks like for the runtime you use.
            </p>
          </aside>
        </div>
      </section>

      {/* Why this split exists */}
      <section className="border-b border-ink-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <h2 className="text-2xl font-semibold text-ink-900">
            Why this split exists
          </h2>
          <p className="mt-2 max-w-3xl text-ink-600">
            Two design choices worth justifying: storing memories and pages
            separately, and having Hindsight regenerate pages instead of
            letting the agent edit them mid-conversation.
          </p>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-ink-200 bg-ink-50 p-5">
              <h3 className="text-lg font-semibold text-ink-900">
                Why memories <em>and</em> pages
              </h3>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-ink-700">
                <li className="flex gap-2">
                  <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
                  <span>
                    <strong>Different jobs.</strong> Memories preserve history;
                    pages compress the current best understanding. A single
                    layer would either overwrite history on every update or
                    grow unbounded.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
                  <span>
                    <strong>Different access patterns.</strong> Pages are
                    fetched whole when the agent decides it needs them — they
                    have to fit a prompt at that moment. Memories are searched
                    on demand and don't.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
                  <span>
                    <strong>Conflict stays auditable.</strong> When two
                    memories disagree, the page resolves to the latest
                    understanding while both memories stay on record. Tracing
                    why a page says X means looking at the facts it recalled —
                    not commit history of edits.
                  </span>
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-ink-200 bg-ink-50 p-5">
              <h3 className="text-lg font-semibold text-ink-900">
                Why Hindsight refreshes pages, not the agent
              </h3>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-ink-700">
                <li className="flex gap-2">
                  <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
                  <span>
                    <strong>One conversation is the wrong input.</strong> A
                    good page summarizes across sessions. The agent inside any
                    single chat doesn't have that view.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
                  <span>
                    <strong>Contradictions resolve themselves.</strong> When
                    two memories disagree, consolidation folds them into
                    observations and the next refresh rewrites the page using
                    the latest understanding — no agent has to pick a winner
                    mid-conversation.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
                  <span>
                    <strong>Full audit trail.</strong> Hindsight retains every
                    memory, every observation, and every page revision, and is
                    optimised for that storage. Tracing why a page changed —
                    which memory triggered it, which observation it came from
                    — is built in. Agent-driven page edits would erase that
                    lineage.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
                  <span>
                    <strong>Drift compounds.</strong> If an agent confabulates
                    and writes the result to a page, the next session loads it
                    as fact. Server-side refresh grounds every regeneration in
                    retained memories, breaking the feedback loop.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
                  <span>
                    <strong>Concurrency.</strong> Two parallel sessions can
                    both retain memories without coordination. They cannot
                    both edit the same page without conflicts. Centralizing
                    writes through Hindsight removes the problem.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
                  <span>
                    <strong>Latency.</strong> Consolidation runs async. In-loop
                    page edits would block the user while the agent re-reads
                    its own memory, dedupes, and rewrites.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* From here */}
      <section className="bg-ink-50">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <h2 className="text-2xl font-semibold text-ink-900">From here</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <Link
              href={link('/harnesses')}
              className="rounded-xl border border-ink-200 bg-white p-5 transition hover:border-accent-300 hover:shadow-sm"
            >
              <h3 className="font-semibold text-ink-900">Pick a harness</h3>
              <p className="mt-1 text-sm text-ink-500">
                Each harness wires the same architecture differently — MCP
                server, plugin, or baked skill.
              </p>
            </Link>
            <Link
              href={link('/agents')}
              className="rounded-xl border border-ink-200 bg-white p-5 transition hover:border-accent-300 hover:shadow-sm"
            >
              <h3 className="font-semibold text-ink-900">Browse agents</h3>
              <p className="mt-1 text-sm text-ink-500">
                Real bank-templates with their own missions, knowledge files,
                and mental models.
              </p>
            </Link>
            <Link
              href={link('/create')}
              className="rounded-xl border border-ink-200 bg-white p-5 transition hover:border-accent-300 hover:shadow-sm"
            >
              <h3 className="font-semibold text-ink-900">Create your own</h3>
              <p className="mt-1 text-sm text-ink-500">
                One name is enough — add seed files or a bank-template only
                if you want to.
              </p>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

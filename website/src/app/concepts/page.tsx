import type { Metadata } from 'next';
import Link from 'next/link';
import { CodeBlock } from '@/components/CodeBlock';
import { Mermaid } from '@/components/Mermaid';
import { link } from '@/lib/link';

export const metadata: Metadata = {
  title: 'Concepts',
  description:
    'The data model behind self-driving agents: memories, knowledge pages, mental models, and the consolidation → refresh loop that keeps pages in sync with conversations.',
};

// Mermaid v11 edge-label syntax notes:
//   solid:  A -->|label| B
//   dotted: A -.->|label| B
// Avoid the `A --"label"--> B` form — it's accepted in some grammars but
// blows up in others (especially with hexagon and parallelogram nodes).
const FLOW = `
flowchart TD
    A([User ↔ Agent conversation]):::agent
    M[/"Memories<br/>world · experience"/]:::hs
    O[/"Observation facts<br/>synthesised server-side"/]:::hs
    T{{"refresh_after_consolidation<br/>trigger fires?"}}:::hs
    R["Recall<br/>filter by fact_types and tags<br/>exclude_mental_models"]:::hs
    G["Generate<br/>source_query to body<br/>capped at max_tokens"]:::hs
    P[("Knowledge page body<br/>updated full or delta")]:::hs
    N([Next session: agent reads pages]):::agent

    A -->|retain| M
    M -->|consolidation| O
    O --> T
    T -->|yes| R
    R --> G
    G --> P
    P --> N
    N -.->|new conversation| A

    classDef agent fill:#d9e6ff,stroke:#3a5ef0,color:#0d0d10,stroke-width:2px
    classDef hs fill:#dcfce7,stroke:#059669,color:#0d0d10,stroke-width:2px
`.trim();

export default function ConceptsPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-ink-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <p className="text-sm font-medium uppercase tracking-wide text-accent-600">
            Concepts
          </p>
          <h1 className="mt-2 text-3xl font-bold text-ink-900 sm:text-4xl">
            Memories, pages, and mental models
          </h1>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-ink-500">
            Two primitives: memories (typed facts) and knowledge pages (long-form
            markdown documents). A mental model is a recipe attached to a page —
            it tells{' '}
            <a
              className="text-accent-600 hover:underline"
              href="https://github.com/vectorize-io/hindsight"
              target="_blank"
              rel="noopener"
            >
              Hindsight
            </a>{' '}
            how to regenerate the page body from the bank's memories. The page is
            the wiki; the mental model is what keeps the wiki fresh.
          </p>
        </div>
      </section>

      {/* Two primitives */}
      <section className="border-b border-ink-200 bg-ink-50">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <h2 className="text-2xl font-semibold text-ink-900">Two primitives</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-ink-200 bg-white p-5">
              <h3 className="text-lg font-semibold text-ink-900">Memories</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-700">
                Typed facts retained from conversations or ingested documents.
                Hindsight stores them in three types:
              </p>
              <ul className="mt-3 space-y-1 text-sm text-ink-700">
                <li>
                  <code className="rounded bg-ink-100 px-1 py-0.5">world</code> —
                  context-independent facts about the world.
                </li>
                <li>
                  <code className="rounded bg-ink-100 px-1 py-0.5">experience</code> —
                  what happened in a specific session, retained verbatim.
                </li>
                <li>
                  <code className="rounded bg-ink-100 px-1 py-0.5">observation</code> —
                  higher-level synthesis produced server-side from world and
                  experience facts during <em>consolidation</em>.
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-ink-200 bg-white p-5">
              <h3 className="text-lg font-semibold text-ink-900">
                Knowledge pages
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-700">
                Markdown documents the agent loads at session start. A page has a
                title, a body, and (optionally) a mental model attached to it.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-ink-700">
                Bodies change in two ways:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-ink-700">
                <li>
                  <strong>Direct edit</strong> — POST / PUT against the page
                  endpoint. The agent or the install CLI does this explicitly.
                </li>
                <li>
                  <strong>Mental-model refresh</strong> — Hindsight regenerates the
                  body server-side from the bank's memories when the model's
                  trigger fires.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Why this split exists */}
      <section className="border-b border-ink-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <h2 className="text-2xl font-semibold text-ink-900">
            Why this split exists
          </h2>
          <p className="mt-2 max-w-3xl text-ink-600">
            Two design choices worth justifying before the mechanics: storing
            memories and pages separately, and having Hindsight regenerate pages
            instead of letting the agent edit them mid-conversation.
          </p>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-ink-200 bg-ink-50 p-5">
              <h3 className="text-lg font-semibold text-ink-900">
                Why memories <em>and</em> pages
              </h3>
              <p className="mt-1 text-sm text-ink-500">Not one layer. Both.</p>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-ink-700">
                <li className="flex gap-2">
                  <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
                  <span>
                    <strong>Different jobs.</strong> Memories preserve history;
                    pages compress the current best understanding. A single layer
                    would either overwrite history on every update or grow
                    unbounded.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
                  <span>
                    <strong>Different access patterns.</strong> Pages are loaded in
                    full at session start — they have to fit a prompt. Memories
                    are searched on demand and don't. You cannot make one shape
                    serve both jobs without bad tradeoffs.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
                  <span>
                    <strong>Recipes can change.</strong> Edit a{' '}
                    <code className="rounded bg-white px-1 py-0.5">source_query</code>{' '}
                    and the page regenerates from the same memories. If the page
                    were the only storage, changing the recipe would mean throwing
                    away what's there.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
                  <span>
                    <strong>Typed and tagged.</strong> Memories carry types —{' '}
                    <code className="rounded bg-white px-1 py-0.5">world</code>,{' '}
                    <code className="rounded bg-white px-1 py-0.5">experience</code>,{' '}
                    <code className="rounded bg-white px-1 py-0.5">observation</code>{' '}
                    — and tags. Pages recall the slice they want instead of
                    reclassifying every time.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
                  <span>
                    <strong>Conflict stays auditable.</strong> When two memories
                    disagree, the page resolves to the latest understanding while
                    both memories stay on record. Tracing why a page says X means
                    looking at the facts it recalled — not commit history of
                    edits.
                  </span>
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-ink-200 bg-ink-50 p-5">
              <h3 className="text-lg font-semibold text-ink-900">
                Why Hindsight refreshes pages, not the agent
              </h3>
              <p className="mt-1 text-sm text-ink-500">No mid-conversation edits.</p>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-ink-700">
                <li className="flex gap-2">
                  <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
                  <span>
                    <strong>One conversation is the wrong input.</strong> A good
                    page summarizes across sessions. The agent inside any single
                    chat doesn't have that view. Recall over the bank — filtered
                    by type, tag, and scope — does.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
                  <span>
                    <strong>Drift compounds.</strong> If an agent confabulates and
                    writes the result to a page, the next session loads it as
                    fact. Server-side refresh grounds every regeneration in
                    retained memories, breaking the feedback loop.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
                  <span>
                    <strong>Concurrency.</strong> Two parallel sessions can both
                    retain memories without coordination. They cannot both edit
                    the same page without conflicts. Centralizing writes through
                    Hindsight removes the problem.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
                  <span>
                    <strong>Latency.</strong> Consolidation and reflect run async.
                    In-loop edits would block the user while the agent re-reads
                    its own memory, dedupes, decides what's stale, and rewrites.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
                  <span>
                    <strong>Determinism and audit.</strong> A page body is a
                    function of{' '}
                    <code className="rounded bg-white px-1 py-0.5">
                      (memories, source_query, max_tokens, mode)
                    </code>
                    . Same inputs ≈ same output. Every refresh records which
                    trigger fired and which facts were pulled. Agent edits don't.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <p className="mt-6 max-w-3xl text-sm leading-relaxed text-ink-600">
            Direct page edits aren't blocked — the REST endpoints are still there
            and harnesses can use them, e.g. when the install CLI seeds the initial
            body. They just aren't the main loop. The main loop is retain →
            consolidate → refresh, with the agent on the read side.
          </p>
        </div>
      </section>

      {/* Mental model in detail */}
      <section className="border-b border-ink-200 bg-ink-50">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <h2 className="text-2xl font-semibold text-ink-900">
            A mental model in detail
          </h2>
          <p className="mt-2 max-w-3xl text-ink-600">
            A mental model is the spec Hindsight follows to (re)write a page. The
            example below is the SEO bank's{' '}
            <code className="rounded bg-ink-100 px-1 py-0.5">SEO Best Practices</code>{' '}
            page recipe.
          </p>

          <div className="mt-5">
            <CodeBlock
              lang="json"
              code={`{
  "id": "seo-best-practices",
  "name": "SEO Best Practices",
  "max_tokens": 4096,
  "source_query": "What are the SEO best practices combining industry standards with what has actually worked?",
  "trigger": {
    "mode": "delta",
    "refresh_after_consolidation": true,
    "fact_types": ["observation"],
    "exclude_mental_models": true
  }
}`}
            />
          </div>

          <h3 className="mt-8 text-lg font-semibold text-ink-900">Field by field</h3>
          <div className="mt-3 overflow-x-auto rounded-xl border border-ink-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-ink-100 text-ink-600">
                <tr>
                  <th className="p-3 text-left font-semibold">Field</th>
                  <th className="p-3 text-left font-semibold">What it does</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-200 text-ink-700">
                <tr>
                  <td className="p-3 align-top">
                    <code className="rounded bg-ink-50 px-1 py-0.5">id</code>
                  </td>
                  <td className="p-3">
                    Stable identifier for the page (lowercase, hyphens). Used to
                    address the model and the page it owns.
                  </td>
                </tr>
                <tr>
                  <td className="p-3 align-top">
                    <code className="rounded bg-ink-50 px-1 py-0.5">name</code>
                  </td>
                  <td className="p-3">
                    Human-readable title shown to the agent at session start.
                  </td>
                </tr>
                <tr>
                  <td className="p-3 align-top">
                    <code className="rounded bg-ink-50 px-1 py-0.5">source_query</code>
                  </td>
                  <td className="p-3">
                    The question Hindsight answers when refreshing the page. The
                    recall step pulls facts that match this query; the LLM then
                    synthesizes the body from those facts.
                  </td>
                </tr>
                <tr>
                  <td className="p-3 align-top">
                    <code className="rounded bg-ink-50 px-1 py-0.5">max_tokens</code>
                  </td>
                  <td className="p-3">
                    Hard cap on the generated body. Keeps long-running pages from
                    drifting into multi-megabyte essays.
                  </td>
                </tr>
                <tr>
                  <td className="p-3 align-top">
                    <code className="rounded bg-ink-50 px-1 py-0.5">trigger.mode</code>
                  </td>
                  <td className="p-3">
                    <strong>
                      <code className="rounded bg-ink-50 px-1 py-0.5">full</code>
                    </strong>{' '}
                    regenerates the body from scratch.{' '}
                    <strong>
                      <code className="rounded bg-ink-50 px-1 py-0.5">delta</code>
                    </strong>{' '}
                    performs surgical edits against the existing body — unchanged
                    sections preserved byte-for-byte, stale removed, new added.
                    Falls back to <code className="rounded bg-ink-50 px-1 py-0.5">full</code>{' '}
                    if the page has no body yet or the source_query changed.
                  </td>
                </tr>
                <tr>
                  <td className="p-3 align-top">
                    <code className="rounded bg-ink-50 px-1 py-0.5">
                      trigger.refresh_after_consolidation
                    </code>
                  </td>
                  <td className="p-3">
                    When <code className="rounded bg-ink-50 px-1 py-0.5">true</code>,
                    the page refreshes automatically after each consolidation pass —
                    i.e., shortly after new memories arrive. This is what makes the
                    loop "real-time".
                  </td>
                </tr>
                <tr>
                  <td className="p-3 align-top">
                    <code className="rounded bg-ink-50 px-1 py-0.5">trigger.fact_types</code>
                  </td>
                  <td className="p-3">
                    Whitelist of fact types the refresh's recall step is allowed to
                    see. Defaults to all three; pinning to{' '}
                    <code className="rounded bg-ink-50 px-1 py-0.5">["observation"]</code>{' '}
                    means the page reflects only the synthesized layer, ignoring raw
                    experience and world facts.
                  </td>
                </tr>
                <tr>
                  <td className="p-3 align-top">
                    <code className="rounded bg-ink-50 px-1 py-0.5">
                      trigger.exclude_mental_models
                    </code>
                  </td>
                  <td className="p-3">
                    Skip other pages during recall. Stops feedback loops where one
                    page's regenerated body keeps influencing another's.
                  </td>
                </tr>
                <tr>
                  <td className="p-3 align-top">
                    <code className="rounded bg-ink-50 px-1 py-0.5">tags</code> /{' '}
                    <code className="rounded bg-ink-50 px-1 py-0.5">trigger.tags_match</code>
                  </td>
                  <td className="p-3">
                    Optional. Restricts recall to memories with matching tags — a
                    way to scope a page to a project, customer, or topic.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Flow diagram */}
      <section className="border-b border-ink-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <h2 className="text-2xl font-semibold text-ink-900">The flow</h2>
          <p className="mt-2 max-w-3xl text-ink-600">
            Blue boxes happen in the harness (Claude Code, Claude skill, OpenClaw,
            NemoClaw). Green boxes happen inside Hindsight. The agent only writes
            memories and reads pages — every other step is server-side.
          </p>

          <div className="mt-8 overflow-x-auto rounded-2xl border border-ink-200 bg-white p-4 sm:p-6">
            <Mermaid id="flow" chart={FLOW} />
          </div>

          <p className="mt-6 max-w-3xl text-sm leading-relaxed text-ink-600">
            The dashed loop is the next conversation. Each cycle, the agent walks
            in already informed by what the previous cycles produced — without
            having decided what to remember or when to write it down.
          </p>
        </div>
      </section>

      {/* Talking to a bank */}
      <section className="border-b border-ink-200 bg-ink-50">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <h2 className="text-2xl font-semibold text-ink-900">Talking to a bank</h2>
          <p className="mt-2 max-w-3xl text-ink-600">
            Most harnesses go through a plugin or MCP server. The endpoints below
            are the primitives those wrappers call. Same shape regardless of harness.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-500">
                Pages
              </h3>
              <div className="mt-2">
                <CodeBlock
                  lang="bash"
                  code={`GET    /v1/default/banks/{bank}/knowledge/pages
GET    /v1/default/banks/{bank}/knowledge/pages/{id}
POST   /v1/default/banks/{bank}/knowledge/pages
PUT    /v1/default/banks/{bank}/knowledge/pages/{id}
DELETE /v1/default/banks/{bank}/knowledge/pages/{id}`}
                />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-500">
                Memories
              </h3>
              <div className="mt-2">
                <CodeBlock
                  lang="bash"
                  code={`POST /v1/default/banks/{bank}/memories/retain
POST /v1/default/banks/{bank}/memories/recall`}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bank-level missions */}
      <section className="border-b border-ink-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <h2 className="text-2xl font-semibold text-ink-900">
            Bank-level missions
          </h2>
          <p className="mt-2 max-w-3xl text-ink-600">
            Two strings on the bank shape what gets retained and how pages get
            rewritten. They apply across every memory and every refresh.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              {
                k: 'Retain mission',
                v: 'Tells the consolidation step what kinds of facts matter for this agent. Biases the observation layer toward the signal you actually care about.',
              },
              {
                k: 'Reflect mission',
                v: 'Prepended to every mental-model refresh. Sets tone and priorities — e.g. "prefer observed performance data over generic best practices".',
              },
            ].map((row) => (
              <div
                key={row.k}
                className="rounded-lg border border-ink-200 bg-ink-50 p-3"
              >
                <div className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                  {row.k}
                </div>
                <p className="mt-1 text-sm text-ink-700">{row.v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What lives where */}
      <section className="border-b border-ink-200 bg-ink-50">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <h2 className="text-2xl font-semibold text-ink-900">What lives where</h2>
          <div className="mt-5 overflow-x-auto rounded-xl border border-ink-200">
            <table className="w-full text-sm">
              <thead className="bg-ink-100 text-ink-600">
                <tr>
                  <th className="p-3 text-left font-semibold">You declare</th>
                  <th className="p-3 text-left font-semibold">CLI sets up</th>
                  <th className="p-3 text-left font-semibold">
                    Lives at runtime in
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-200 bg-white">
                <tr>
                  <td className="p-3 align-top">
                    <code className="rounded bg-ink-100 px-1 py-0.5">
                      bank.reflect_mission
                    </code>
                    ,{' '}
                    <code className="rounded bg-ink-100 px-1 py-0.5">retain_mission</code>
                  </td>
                  <td className="p-3 align-top">Bank record in Hindsight</td>
                  <td className="p-3 align-top">
                    Read on every retain, consolidation, and refresh
                  </td>
                </tr>
                <tr>
                  <td className="p-3 align-top">
                    <code className="rounded bg-ink-100 px-1 py-0.5">mental_models[]</code>
                  </td>
                  <td className="p-3 align-top">
                    One page per model, with the trigger registered
                  </td>
                  <td className="p-3 align-top">
                    Pages list at session start; refreshed by Hindsight on trigger
                  </td>
                </tr>
                <tr>
                  <td className="p-3 align-top">
                    Seed{' '}
                    <code className="rounded bg-ink-100 px-1 py-0.5">.md</code>/
                    <code className="rounded bg-ink-100 px-1 py-0.5">.txt</code>{' '}
                    files
                  </td>
                  <td className="p-3 align-top">
                    Ingested as initial memories (world / experience facts)
                  </td>
                  <td className="p-3 align-top">
                    Consumed via consolidation and recall, never read directly
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Next */}
      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <h2 className="text-2xl font-semibold text-ink-900">From here</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <Link
              href={link('/agents')}
              className="rounded-xl border border-ink-200 bg-ink-50 p-5 transition hover:border-accent-300 hover:bg-white"
            >
              <h3 className="font-semibold text-ink-900">
                Read real bank-templates
              </h3>
              <p className="mt-1 text-sm text-ink-500">
                Each marketing template has its own missions and mental models —
                see them in context.
              </p>
            </Link>
            <Link
              href={link('/harnesses')}
              className="rounded-xl border border-ink-200 bg-ink-50 p-5 transition hover:border-accent-300 hover:bg-white"
            >
              <h3 className="font-semibold text-ink-900">Pick a harness</h3>
              <p className="mt-1 text-sm text-ink-500">
                Each harness exposes the same bank through MCP, a plugin, or a
                baked skill.
              </p>
            </Link>
            <Link
              href={link('/quickstart')}
              className="rounded-xl border border-ink-200 bg-ink-50 p-5 transition hover:border-accent-300 hover:bg-white"
            >
              <h3 className="font-semibold text-ink-900">Quick start</h3>
              <p className="mt-1 text-sm text-ink-500">
                Install one in a single command and watch the loop run.
              </p>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

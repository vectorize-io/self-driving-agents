import type { Metadata } from 'next';
import Link from 'next/link';
import { CodeBlock } from '@/components/CodeBlock';
import { Inline } from '@/components/Inline';
import { link } from '@/lib/link';

export const metadata: Metadata = {
  title: 'Create your own',
  description:
    'Build your own self-driving agent. Start blank with --empty, or pre-seed from a directory of markdown / a bank-template.json. Same loop, your domain.',
};

const NPM = 'npx @vectorize-io/self-driving-agents';

interface HarnessRecipe {
  /** harness slug */
  slug: string;
  /** human-readable name */
  name: string;
  /** what to know about this harness's setup before installing — 1-2 sentences */
  prereq: string;
  /** what happens after install — short prose, can use `code` markers */
  followUp: string;
}

/**
 * Per-harness install copy specific to "Create your own". Each harness here
 * adds the same `--empty` flag for the blank case, and accepts a local dir
 * for the pre-seeded case. Only the prerequisites and the post-install step
 * differ.
 */
const RECIPES: HarnessRecipe[] = [
  {
    slug: 'claude-code',
    name: 'Claude Code',
    prereq:
      'Make sure `claude` is on PATH. The CLI installs the `hindsight-memory` plugin, configures the connection, and allowlists the right tools.',
    followUp:
      '`cd` into the project directory you want this agent scoped to, run `claude`, then paste the prompt the CLI printed. With `--empty` the prompt is just `/hindsight-memory:create-agent <name>` and the skill takes it from there interactively.',
  },
  {
    slug: 'claude',
    name: 'Claude Chat & Cowork',
    prereq:
      'Pick Cloud or self-hosted Hindsight when prompted. Self-hosted must be reachable from Claude\'s servers.',
    followUp:
      'The CLI generates a self-contained skill zip. Upload it via Customize → Skills → Upload, allowlist the Hindsight host in Settings → Capabilities, then activate the agent in any chat with `/<agent-name>`.',
  },
  {
    slug: 'openclaw',
    name: 'OpenClaw',
    prereq:
      'Have OpenClaw installed and on PATH. The CLI installs (or upgrades) the `hindsight-openclaw` plugin and runs its setup wizard if you don\'t have a connection configured.',
    followUp:
      'Restart the gateway with `openclaw gateway restart`, then open a session: `openclaw tui --session agent:<name>:main:session1`.',
  },
  {
    slug: 'nemoclaw',
    name: 'NemoClaw',
    prereq:
      'Have NemoClaw + at least one sandbox (`nemoclaw onboard`). The CLI patches the sandbox network policy so the plugin can reach Hindsight.',
    followUp:
      'Connect to the sandbox with `nemoclaw <sandbox> connect`, then open a session: `openclaw tui --session agent:main:main:session1`.',
  },
  {
    slug: 'hermes',
    name: 'Hermes',
    prereq:
      'Have `hermes` (NousResearch hermes-agent) on PATH. The CLI creates a Hermes profile named after the agent and drops in the `hindsight-sda` plugin.',
    followUp:
      'Start chatting: `hermes -p <name> chat`. Memory retains automatically from the first turn.',
  },
];

export default function CreatePage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-ink-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <p className="text-sm font-medium uppercase tracking-wide text-accent-600">
            Build your own
          </p>
          <h1 className="mt-2 text-3xl font-bold text-ink-900 sm:text-4xl">
            Create your own self-driving agent
          </h1>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-ink-500">
            Start blank with a single command, or pre-seed an agent from a
            directory of markdown and a <code className="rounded bg-ink-100 px-1 py-0.5">bank-template.json</code>.
            Same self-driving loop, your domain.
          </p>
        </div>
      </section>

      {/* Three levels */}
      <section className="border-b border-ink-200 bg-ink-50">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <h2 className="text-2xl font-semibold text-ink-900">
            Three levels of structure
          </h2>
          <p className="mt-2 max-w-3xl text-ink-600">
            Each level is optional. Pick the one that matches what you have on
            hand right now; you can always grow into the others.
          </p>

          <div className="mt-8 space-y-6">
            {/* Level 1 */}
            <div className="rounded-xl border border-ink-200 bg-white p-6">
              <div className="flex items-baseline gap-3">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent-500 text-sm font-semibold text-white">
                  1
                </span>
                <h3 className="text-lg font-semibold text-ink-900">
                  Just a name
                </h3>
                <span className="ml-1 rounded bg-ink-100 px-2 py-0.5 text-xs font-mono text-ink-600">
                  --empty
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-700">
                Pick a name, pick a harness. The CLI provisions the bank, sets
                up the harness, and that's it — the agent has its full tool
                surface from day one and learns everything from the
                conversation.
              </p>
              <div className="mt-4">
                <CodeBlock code={`${NPM} install my-agent --harness claude-code --empty`} />
              </div>
              <p className="mt-3 text-sm text-ink-500">
                Then in any chat:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-ink-600">
                <li>
                  <span className="text-ink-400">›</span> "Ingest{' '}
                  <code className="rounded bg-ink-100 px-1 py-0.5">
                    https://example.com/playbook
                  </code>{' '}
                  and remember the key points."
                </li>
                <li>
                  <span className="text-ink-400">›</span> "Read this PDF and
                  build a page on common pitfalls."
                </li>
                <li>
                  <span className="text-ink-400">›</span> "Save what we just
                  decided as a page called <em>release-checklist</em>."
                </li>
              </ul>
            </div>

            {/* Level 2 */}
            <div className="rounded-xl border border-ink-200 bg-white p-6">
              <div className="flex items-baseline gap-3">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent-500 text-sm font-semibold text-white">
                  2
                </span>
                <h3 className="text-lg font-semibold text-ink-900">
                  Add seed knowledge
                </h3>
                <span className="ml-1 rounded bg-ink-100 px-2 py-0.5 text-xs font-mono text-ink-600">
                  ./my-agent
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-700">
                If you already have docs, drop any{' '}
                <code className="rounded bg-ink-100 px-1 py-0.5">.md</code> or{' '}
                <code className="rounded bg-ink-100 px-1 py-0.5">.txt</code>{' '}
                files in a directory. The CLI ingests them as initial memories
                so the agent walks in with prior context.
              </p>
              <div className="mt-4">
                <CodeBlock
                  lang="text"
                  code={`my-agent/
  playbook.md
  reference.md`}
                />
              </div>
              <div className="mt-3">
                <CodeBlock code={`${NPM} install ./my-agent --harness claude-code`} />
              </div>
            </div>

            {/* Level 3 */}
            <div className="rounded-xl border border-ink-200 bg-white p-6">
              <div className="flex items-baseline gap-3">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent-500 text-sm font-semibold text-white">
                  3
                </span>
                <h3 className="text-lg font-semibold text-ink-900">
                  Pre-seed pages with{' '}
                  <code className="rounded bg-ink-100 px-1 py-0.5">
                    bank-template.json
                  </code>
                </h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-700">
                When you know which pages you want and what should fill them,
                add a{' '}
                <code className="rounded bg-ink-100 px-1 py-0.5">
                  bank-template.json
                </code>{' '}
                with{' '}
                <code className="rounded bg-ink-100 px-1 py-0.5">
                  mental_models[]
                </code>
                . Hindsight provisions the bank, creates one page per model,
                and keeps each one in sync with the bank's memories. See{' '}
                <Link href={link('/concept')} className="text-accent-600 hover:underline">
                  the concept page
                </Link>{' '}
                for what mental models do.
              </p>
              <div className="mt-4">
                <CodeBlock
                  lang="text"
                  code={`my-agent/
  bank-template.json     # mission, mental_models, ...
  playbook.md
  reference.md`}
                />
              </div>
              <div className="mt-3">
                <CodeBlock
                  lang="json"
                  code={`{
  "version": "1",
  "bank": {
    "reflect_mission": "You are the long-term memory for ...",
    "retain_mission": "Extract ..."
  },
  "mental_models": [
    {
      "id": "playbook",
      "name": "Playbook",
      "source_query": "What patterns have we observed working?",
      "trigger": { "mode": "delta", "refresh_after_consolidation": true }
    }
  ]
}`}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Per-harness recipes */}
      <section className="border-b border-ink-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <h2 className="text-2xl font-semibold text-ink-900">
            Run it on your harness
          </h2>
          <p className="mt-2 max-w-3xl text-ink-600">
            Same install command shape across every harness. Replace{' '}
            <code className="rounded bg-ink-100 px-1 py-0.5">my-agent</code>{' '}
            with your name, swap the harness flag, and follow the post-install
            step.
          </p>

          <div className="mt-8 space-y-6">
            {RECIPES.map((r) => (
              <div
                key={r.slug}
                className="rounded-xl border border-ink-200 bg-ink-50 p-6"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h3 className="text-lg font-semibold text-ink-900">
                    {r.name}
                  </h3>
                  <Link
                    href={link(`/harnesses/${r.slug}`)}
                    className="text-sm font-medium text-accent-600 hover:underline"
                  >
                    Full guide →
                  </Link>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-ink-700">
                  <Inline text={r.prereq} />
                </p>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-500">
                      Blank
                    </p>
                    <CodeBlock
                      code={`${NPM} install my-agent --harness ${r.slug} --empty`}
                    />
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-500">
                      From a directory
                    </p>
                    <CodeBlock
                      code={`${NPM} install ./my-agent --harness ${r.slug}`}
                    />
                  </div>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-ink-600">
                  <Inline text={r.followUp} />
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Multi-agent teams */}
      <section className="border-b border-ink-200 bg-ink-50">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <h2 className="text-2xl font-semibold text-ink-900">
            Multi-agent teams
          </h2>
          <p className="mt-2 max-w-3xl text-ink-600">
            Need a department of specialists? Nest directories. Each level
            with a{' '}
            <code className="rounded bg-ink-100 px-1 py-0.5">
              bank-template.json
            </code>{' '}
            is its own installable agent. Install the parent to get
            everything; install a child to get just that specialist.
          </p>
          <div className="mt-5">
            <CodeBlock
              lang="text"
              code={`my-team/
  bank-template.json         # install my-team → everything below
  specialist-a/
    bank-template.json       # install my-team/specialist-a → just this
    playbook.md
  specialist-b/
    bank-template.json
    reference.md`}
            />
          </div>
          <p className="mt-3 text-sm text-ink-500">
            See{' '}
            <Link href={link('/agents')} className="text-accent-600 hover:underline">
              the marketing template
            </Link>{' '}
            for a full example with sub-departments.
          </p>
        </div>
      </section>

      {/* Where to next */}
      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <h2 className="text-2xl font-semibold text-ink-900">From here</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <Link
              href={link('/concept')}
              className="rounded-xl border border-ink-200 bg-ink-50 p-5 transition hover:border-accent-300 hover:bg-white"
            >
              <h3 className="font-semibold text-ink-900">How it works</h3>
              <p className="mt-1 text-sm text-ink-500">
                The architecture and the tools the agent gets — read pages,
                ingest, recall.
              </p>
            </Link>
            <Link
              href={link('/agents')}
              className="rounded-xl border border-ink-200 bg-ink-50 p-5 transition hover:border-accent-300 hover:bg-white"
            >
              <h3 className="font-semibold text-ink-900">See real templates</h3>
              <p className="mt-1 text-sm text-ink-500">
                The marketing department and its specialists — full
                bank-templates with seed content.
              </p>
            </Link>
            <Link
              href={link('/harnesses')}
              className="rounded-xl border border-ink-200 bg-ink-50 p-5 transition hover:border-accent-300 hover:bg-white"
            >
              <h3 className="font-semibold text-ink-900">Compare harnesses</h3>
              <p className="mt-1 text-sm text-ink-500">
                Five integrations, each tuned to its runtime.
              </p>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

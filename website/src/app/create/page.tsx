import type { Metadata } from 'next';
import Link from 'next/link';
import { CodeBlock } from '@/components/CodeBlock';
import { HarnessCodeBlock } from '@/components/HarnessCodeBlock';
import { link } from '@/lib/link';

export const metadata: Metadata = {
  title: 'Create your own',
  description:
    'Build your own self-driving agent. Start blank with --empty, or pre-seed from a directory of markdown / a bank-template.json. Same loop, your domain.',
};

const NPM = 'npx @vectorize-io/self-driving-agents';

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
                <HarnessCodeBlock
                  template={`${NPM} install my-agent --harness {harness} --empty`}
                />
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
                <HarnessCodeBlock
                  template={`${NPM} install ./my-agent --harness {harness}`}
                />
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
    "retain_mission": "Extract ...",
    "observations_mission": "Observations are stable facts about ..."
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

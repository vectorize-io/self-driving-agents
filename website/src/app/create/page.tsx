import type { Metadata } from 'next';
import Link from 'next/link';
import { CodeBlock } from '@/components/CodeBlock';
import { HARNESSES } from '@/lib/harnesses';
import { link } from '@/lib/link';

export const metadata: Metadata = {
  title: 'Create your own',
  description:
    'Build your own self-driving agent. The agent directory is optional, the bank-template.json is optional, the .md seed files are optional — at minimum you just pick a name and start chatting.',
};

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
            An agent is a name plus, optionally, some seed knowledge. The
            harness wires in tools so the agent can look things up, ingest
            URLs and files you give it, and write back to its own pages.
            Nothing about the directory layout is mandatory — you can start
            with literally nothing and let the agent build itself as you chat.
          </p>
        </div>
      </section>

      {/* Three escalating levels */}
      <section className="border-b border-ink-200 bg-ink-50">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <h2 className="text-2xl font-semibold text-ink-900">
            Three levels — pick what you need
          </h2>
          <p className="mt-2 max-w-3xl text-ink-600">
            Each level is optional. Skip straight to a name if you want; add
            structure later when patterns emerge.
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
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-700">
                The lowest-effort path. Pick a name, run the install with the
                harness you want, start chatting. The bank is provisioned
                empty; the agent has its full tool surface from day one and
                can ingest anything you ask it to.
              </p>
              <div className="mt-4">
                <CodeBlock code="npx @vectorize-io/self-driving-agents install my-agent --harness claude-code" />
              </div>
              <p className="mt-3 text-sm text-ink-500">
                Then in the conversation, just ask:
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
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-700">
                If you already have docs, drop any{' '}
                <code className="rounded bg-ink-100 px-1 py-0.5">.md</code> or{' '}
                <code className="rounded bg-ink-100 px-1 py-0.5">.txt</code>{' '}
                files in a directory. The CLI ingests them as initial
                memories so the agent walks in with prior context — no
                templating required.
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
                <CodeBlock code="npx @vectorize-io/self-driving-agents install ./my-agent --harness claude-code" />
              </div>
            </div>

            {/* Level 3 */}
            <div className="rounded-xl border border-ink-200 bg-white p-6">
              <div className="flex items-baseline gap-3">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent-500 text-sm font-semibold text-white">
                  3
                </span>
                <h3 className="text-lg font-semibold text-ink-900">
                  Pre-seed the wiki with{' '}
                  <code className="rounded bg-ink-100 px-1 py-0.5">
                    bank-template.json
                  </code>
                </h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-700">
                When you know the pages you want and what should fill them,
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

      {/* Multi-agent teams */}
      <section className="border-b border-ink-200 bg-white">
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

      {/* Install commands per harness */}
      <section className="border-b border-ink-200 bg-ink-50">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <h2 className="text-2xl font-semibold text-ink-900">
            Pick a harness
          </h2>
          <p className="mt-2 max-w-3xl text-ink-600">
            Same agent, different runtime. Replace{' '}
            <code className="rounded bg-ink-100 px-1 py-0.5">my-agent</code>{' '}
            with your name (or path) and pick the harness you actually use:
          </p>

          <div className="mt-6 space-y-4">
            {HARNESSES.map((h) => (
              <div
                key={h.slug}
                className="rounded-xl border border-ink-200 bg-white p-5"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold text-ink-900">{h.name}</h3>
                  <Link
                    href={link(`/harnesses/${h.slug}`)}
                    className="text-sm font-medium text-accent-600 hover:underline"
                  >
                    Full guide →
                  </Link>
                </div>
                <CodeBlock
                  code={`npx @vectorize-io/self-driving-agents install my-agent ${h.flag}`}
                />
              </div>
            ))}
          </div>
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
                ingest, retain, recall.
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

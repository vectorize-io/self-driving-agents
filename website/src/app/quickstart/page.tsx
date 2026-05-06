import type { Metadata } from 'next';
import Link from 'next/link';
import { CodeBlock } from '@/components/CodeBlock';
import { HARNESSES } from '@/lib/harnesses';
import { link } from '@/lib/link';

export const metadata: Metadata = {
  title: 'Quick start',
  description:
    'Install a self-driving agent on your harness in one command.',
};

export default function QuickstartPage() {
  return (
    <>
      <section className="border-b border-ink-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <p className="text-sm font-medium uppercase tracking-wide text-accent-600">
            Get started
          </p>
          <h1 className="mt-2 text-3xl font-bold text-ink-900 sm:text-4xl">
            Quick start
          </h1>
          <p className="mt-3 max-w-2xl text-ink-500">
            One CLI call sets up the memory bank, ingests seed knowledge, and
            registers the agent with your harness. Pick an agent, pick a harness,
            run.
          </p>
        </div>
      </section>

      <section className="border-b border-ink-200 bg-ink-50">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <h2 className="text-xl font-semibold text-ink-900">Before you start</h2>
          <ul className="mt-4 space-y-2 text-sm text-ink-700">
            <li className="flex gap-2">
              <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
              A supported harness (Claude Code, Claude Chat, Claude Cowork, OpenClaw,
              or NemoClaw).
            </li>
            <li className="flex gap-2">
              <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
              A Hindsight account —{' '}
              <a
                className="text-accent-600 hover:underline"
                href="https://hindsight.vectorize.io"
                target="_blank"
                rel="noopener"
              >
                Cloud
              </a>{' '}
              or self-hosted.
            </li>
            <li className="flex gap-2">
              <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
              Node.js 22+ on the machine running the CLI.
            </li>
          </ul>
        </div>
      </section>

      <section className="border-b border-ink-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <h2 className="text-xl font-semibold text-ink-900">
            Install in one command
          </h2>
          <p className="mt-2 text-sm text-ink-500">
            Replace the agent slug or harness flag as needed.
          </p>

          <div className="mt-6 space-y-4">
            {HARNESSES.map((h) => (
              <div
                key={h.slug}
                className="rounded-xl border border-ink-200 bg-ink-50 p-5"
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
                  code={`npx @vectorize-io/self-driving-agents install marketing/seo ${h.flag}`}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-ink-200 bg-ink-50">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <h2 className="text-xl font-semibold text-ink-900">Use your own agent</h2>
          <p className="mt-2 text-sm text-ink-500">
            An agent is just a directory: a{' '}
            <code className="rounded bg-ink-100 px-1 py-0.5">bank-template.json</code>{' '}
            next to one or more <code className="rounded bg-ink-100 px-1 py-0.5">.md</code>
            {' '}files.
          </p>

          <div className="mt-5">
            <CodeBlock
              lang="text"
              code={`my-agent/
  bank-template.json     # memory bank + knowledge pages config
  playbook.md            # any .md/.txt becomes seed knowledge
  advanced-tips.md`}
            />
          </div>

          <p className="mt-4 text-sm text-ink-600">Local path:</p>
          <div className="mt-2">
            <CodeBlock code="npx @vectorize-io/self-driving-agents install ./my-agent --harness claude-code" />
          </div>

          <p className="mt-4 text-sm text-ink-600">Or from any GitHub repo:</p>
          <div className="mt-2">
            <CodeBlock code="npx @vectorize-io/self-driving-agents install my-org/my-repo/my-agent --harness openclaw" />
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <h2 className="text-xl font-semibold text-ink-900">Next steps</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Link
              href={link('/agents')}
              className="rounded-xl border border-ink-200 bg-ink-50 p-5 transition hover:border-accent-300 hover:bg-white"
            >
              <h3 className="font-semibold text-ink-900">Browse agents</h3>
              <p className="mt-1 text-sm text-ink-500">
                Pick a marketing specialty or install the whole department.
              </p>
            </Link>
            <Link
              href={link('/harnesses')}
              className="rounded-xl border border-ink-200 bg-ink-50 p-5 transition hover:border-accent-300 hover:bg-white"
            >
              <h3 className="font-semibold text-ink-900">Compare harnesses</h3>
              <p className="mt-1 text-sm text-ink-500">
                Detailed setup for Claude Code, Claude Chat, OpenClaw, NemoClaw.
              </p>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

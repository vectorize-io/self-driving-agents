import Link from 'next/link';
import { AgentCard } from '@/components/AgentCard';
import { CodeBlock } from '@/components/CodeBlock';
import { HarnessCodeBlock } from '@/components/HarnessCodeBlock';
import { HarnessLogo } from '@/components/HarnessLogo';
import { loadRoots } from '@/lib/agents';
import { HARNESSES } from '@/lib/harnesses';
import { link } from '@/lib/link';

export default function HomePage() {
  const roots = loadRoots();
  const featured = roots.flatMap((r) => [r, ...r.children]).slice(0, 9);

  return (
    <>
      {/* Hero */}
      <section className="border-b border-ink-200 bg-gradient-to-b from-white to-ink-50">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="max-w-3xl">
            <span className="inline-block rounded-full border border-ink-200 bg-white px-3 py-1 text-xs font-medium text-ink-500">
              Powered by Hindsight · Portable agent memory
            </span>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-ink-900 sm:text-5xl md:text-6xl">
              Agents that{' '}
              <span className="text-accent-600">learn from every conversation</span>{' '}
              and get better over time.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-ink-500">
              Install in one command. They build their own knowledge pages, remember
              what you like, and keep themselves current — across Claude Code, Claude
              Chat, OpenClaw, and NemoClaw.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href={link('/create')}
                className="rounded-lg bg-accent-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-600"
              >
                Create your own →
              </Link>
              <Link
                href={link('/agents')}
                className="rounded-lg border border-ink-200 bg-white px-5 py-2.5 text-sm font-semibold text-ink-700 transition hover:border-ink-300"
              >
                Browse agents
              </Link>
            </div>

            <div className="mt-10 max-w-2xl">
              <HarnessCodeBlock
                template="npx @vectorize-io/self-driving-agents install marketing/seo --harness {harness}"
              />
              <p className="mt-2 text-xs text-ink-400">
                Pick your harness above, or replace the agent slug with any
                template you want.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-ink-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-2xl font-bold text-ink-900 sm:text-3xl">
              How it works
            </h2>
            <p className="mt-2 text-ink-500">
              You never tell the agent to "save" or "remember." It decides what
              matters and keeps itself current.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                n: '1',
                title: 'You chat with the agent',
                body: 'Use it like any normal assistant. Ask questions, give feedback, share context.',
              },
              {
                n: '2',
                title: 'Memory is retained',
                body: 'Conversations are auto-summarized into Hindsight as durable, structured memory.',
              },
              {
                n: '3',
                title: 'Knowledge pages update themselves',
                body: 'After each session the agent rewrites the pages it owns — playbooks, references, preferences.',
              },
              {
                n: '4',
                title: 'Next session it remembers',
                body: 'On the next chat the agent reads its current pages — it knows what works and what you prefer.',
              },
            ].map((step) => (
              <div
                key={step.n}
                className="rounded-xl border border-ink-200 bg-ink-50 p-5"
              >
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-md bg-accent-500 text-sm font-semibold text-white">
                  {step.n}
                </div>
                <h3 className="font-semibold text-ink-900">{step.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-500">
                  {step.body}
                </p>
              </div>
            ))}
          </div>

          <Link
            href={link('/concept')}
            className="group mt-8 flex flex-wrap items-start gap-4 rounded-xl border border-accent-200 bg-accent-50/50 p-5 transition hover:border-accent-300 hover:bg-accent-50"
          >
            <span
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-500 text-base font-bold text-white"
              aria-hidden
            >
              📒
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-ink-900 group-hover:text-accent-700">
                Want the deeper picture?
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-600">
                See how the harness, the agent, and Hindsight fit together —
                what crosses the boundary, what stays server-side, and why
                pages and memories live in two layers.
              </p>
            </div>
            <span
              className="self-center text-sm font-semibold text-accent-600 group-hover:underline"
              aria-hidden
            >
              Read the concept →
            </span>
          </Link>
        </div>
      </section>

      {/* Available agents */}
      <section className="border-b border-ink-200 bg-ink-50">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-ink-900 sm:text-3xl">
                Available agents
              </h2>
              <p className="mt-2 text-ink-500">
                Install the whole department or pick a specialty.
              </p>
            </div>
            <Link
              href={link('/agents')}
              className="text-sm font-medium text-accent-600 hover:underline"
            >
              See all agents →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((a) => (
              <AgentCard
                key={a.slug}
                agent={a}
                href={link(`/agents/${a.slug}`)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Harnesses */}
      <section className="border-b border-ink-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-ink-900 sm:text-3xl">
                Harnesses
              </h2>
              <p className="mt-2 text-ink-500">
                Same agent, different runtimes. Pick the one you already use.
              </p>
            </div>
            <Link
              href={link('/harnesses')}
              className="text-sm font-medium text-accent-600 hover:underline"
            >
              Compare harnesses →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {HARNESSES.map((h) => (
              <Link
                key={h.slug}
                href={link(`/harnesses/${h.slug}`)}
                className="group flex flex-col rounded-xl border border-ink-200 bg-ink-50 p-6 transition hover:-translate-y-0.5 hover:border-accent-300 hover:bg-white"
              >
                <HarnessLogo harness={h} size="h-10 w-10" />
                <h3 className="mt-4 text-lg font-semibold text-ink-900 group-hover:text-accent-700">
                  {h.name}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-500">
                  {h.tagline}
                </p>
                <code className="mt-4 inline-block w-fit rounded bg-ink-100 px-2 py-1 text-xs text-ink-700">
                  {h.flag}
                </code>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Roll your own */}
      <section className="bg-ink-900 text-ink-100">
        <div className="mx-auto grid max-w-6xl items-start gap-10 px-6 py-16 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Or roll your own agent.
            </h2>
            <p className="mt-3 text-ink-300">
              An agent is just a directory: drop a{' '}
              <code className="rounded bg-ink-700 px-1.5 py-0.5">
                bank-template.json
              </code>{' '}
              next to some markdown files and point the CLI at it. Same self-driving
              behavior, your domain.
            </p>
            <a
              href="https://github.com/vectorize-io/self-driving-agents#create-your-own"
              target="_blank"
              rel="noopener"
              className="mt-6 inline-flex items-center rounded-lg bg-accent-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-400"
            >
              Read the spec →
            </a>
          </div>

          <div>
            <CodeBlock
              lang="text"
              code={`my-agent/
  bank-template.json     # memory bank + knowledge pages config
  playbook.md            # any .md/.txt becomes seed knowledge
  advanced-tips.md`}
            />
            <div className="mt-3">
              <CodeBlock code="npx @vectorize-io/self-driving-agents install ./my-agent --harness claude-code" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { CodeBlock } from '@/components/CodeBlock';
import { HarnessLogo } from '@/components/HarnessLogo';
import { HARNESSES } from '@/lib/harnesses';
import { link } from '@/lib/link';

export const metadata: Metadata = {
  title: 'Harnesses',
  description:
    'Run self-driving agents on Claude Code, Claude Chat, OpenClaw, or NemoClaw — same agent definition, different runtimes.',
};

export default function HarnessesIndex() {
  return (
    <>
      <section className="border-b border-ink-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <p className="text-sm font-medium uppercase tracking-wide text-accent-600">
            Integrations
          </p>
          <h1 className="mt-2 text-3xl font-bold text-ink-900 sm:text-4xl">
            Harnesses
          </h1>
          <p className="mt-3 max-w-2xl text-ink-500">
            A harness is the runtime where you actually chat with the agent. Pick the
            one you already use — the same agent template installs in all of them.
          </p>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-6 sm:grid-cols-2">
            {HARNESSES.map((h) => (
              <Link
                key={h.slug}
                href={link(`/harnesses/${h.slug}`)}
                className="group flex flex-col rounded-xl border border-ink-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-accent-300 hover:shadow-md"
              >
                <HarnessLogo harness={h} size="h-12 w-12" />
                <h2 className="mt-4 text-xl font-semibold text-ink-900 group-hover:text-accent-700">
                  {h.name}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-ink-500">
                  {h.tagline}
                </p>
                <div className="mt-4">
                  <CodeBlock
                    code={`npx @vectorize-io/self-driving-agents install marketing/seo ${h.flag}`}
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

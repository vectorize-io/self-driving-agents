import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CodeBlock } from '@/components/CodeBlock';
import { HarnessLogo } from '@/components/HarnessLogo';
import { findHarness, HARNESSES } from '@/lib/harnesses';
import { link } from '@/lib/link';

interface Params {
  slug: string;
}

export function generateStaticParams(): Params[] {
  return HARNESSES.map((h) => ({ slug: h.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const h = findHarness(slug);
  if (!h) return {};
  return { title: h.name, description: h.tagline };
}

export default async function HarnessDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const harness = findHarness(slug);
  if (!harness) notFound();

  return (
    <>
      <section className="border-b border-ink-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <nav className="mb-4 text-xs text-ink-400">
            <Link href={link('/harnesses')} className="hover:text-ink-600">
              harnesses
            </Link>
            <span className="mx-1">/</span>
            <span>{harness.slug}</span>
          </nav>

          <HarnessLogo harness={harness} size="h-14 w-14" />
          <h1 className="mt-4 text-3xl font-bold text-ink-900 sm:text-4xl">
            {harness.name}
          </h1>
          <p className="mt-2 text-lg text-ink-500">{harness.tagline}</p>
          <code className="mt-4 inline-block rounded bg-ink-100 px-2 py-1 font-mono text-sm text-ink-700">
            {harness.flag}
          </code>
        </div>
      </section>

      <section className="border-b border-ink-200 bg-ink-50">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <p className="text-base leading-relaxed text-ink-700">{harness.intro}</p>
          <div className="mt-5 rounded-xl border border-ink-200 bg-white p-4 text-sm text-ink-600">
            <span className="font-semibold text-ink-900">Who it's for:</span>{' '}
            {harness.audience}
          </div>
        </div>
      </section>

      <section className="border-b border-ink-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <h2 className="text-xl font-semibold text-ink-900">How to run it</h2>
          <ol className="mt-6 space-y-6">
            {harness.steps.map((s, i) => (
              <li key={i} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-500 text-sm font-semibold text-white">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <h3 className="font-semibold text-ink-900">{s.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-600">
                    {s.body}
                  </p>
                  {s.code && (
                    <div className="mt-3">
                      <CodeBlock code={s.code} />
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Bank mapping */}
      <section className="border-b border-ink-200 bg-ink-50">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <h2 className="text-xl font-semibold text-ink-900">
            Mapping into a Hindsight bank
          </h2>
          <p className="mt-1 text-sm text-ink-500">
            Where the agent → bank binding lives, and how to change it.
          </p>

          <aside
            className="mt-5 rounded-xl bg-accent-50/60 p-5 ring-1 ring-inset ring-accent-200"
            role="note"
          >
            <p className="text-sm font-semibold text-ink-900">
              {harness.bankMapping.summary}
            </p>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink-700">
              {harness.bankMapping.details.map((line, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent-400" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <section className="border-b border-ink-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <h2 className="text-xl font-semibold text-ink-900">Under the hood</h2>
          <ul className="mt-5 space-y-3 text-sm leading-relaxed text-ink-700">
            {harness.howItWorks.map((line, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {harness.links.length > 0 && (
        <section className="bg-white">
          <div className="mx-auto max-w-4xl px-6 py-10">
            <h2 className="text-xl font-semibold text-ink-900">Resources</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {harness.links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noopener"
                  className="rounded-lg border border-ink-200 bg-ink-50 px-4 py-2 text-sm font-medium text-ink-700 transition hover:border-accent-300 hover:bg-white"
                >
                  {l.label} →
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

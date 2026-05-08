import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { marked } from 'marked';
import { CodeBlock } from '@/components/CodeBlock';
import { HarnessCodeBlock } from '@/components/HarnessCodeBlock';
import { findAgent, flattenAgents, type AgentFile } from '@/lib/agents';
import { link } from '@/lib/link';

interface Params {
  slug: string[];
}

export function generateStaticParams(): Params[] {
  return flattenAgents().map((a) => ({ slug: a.slug.split('/') }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const agent = findAgent(slug.join('/'));
  if (!agent) return {};
  return {
    title: agent.displayName,
    description: agent.bank?.retain_mission ?? '',
  };
}

const colorOf = (f: AgentFile): string => {
  const c = f.color;
  if (!c) return '#3a5ef0';
  if (/^#[0-9a-f]{3,8}$/i.test(c)) return c;
  return c;
};

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const fullSlug = slug.join('/');
  const agent = findAgent(fullSlug);
  if (!agent) notFound();

  const segments = agent.slug.split('/');
  const crumbs = segments.map((seg, i) => {
    const sub = segments.slice(0, i + 1).join('/');
    return { label: seg, href: link(`/agents/${sub}`) };
  });

  const installTemplate = `npx @vectorize-io/self-driving-agents install ${agent.slug} --harness {harness}`;

  return (
    <>
      {/* Header */}
      <section className="border-b border-ink-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <nav className="mb-4 flex flex-wrap items-center gap-1 text-xs text-ink-400">
            <Link href={link('/agents')} className="hover:text-ink-600">
              agents
            </Link>
            {crumbs.map((c) => (
              <span key={c.href} className="flex items-center gap-1">
                <span>/</span>
                <Link href={c.href} className="hover:text-ink-600">
                  {c.label}
                </Link>
              </span>
            ))}
          </nav>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-ink-900 sm:text-4xl">
                {agent.displayName}
              </h1>
              <p className="mt-1 font-mono text-sm text-ink-400">{agent.slug}</p>
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="rounded-full bg-ink-100 px-3 py-1 text-ink-600">
                {agent.totalFiles} knowledge{' '}
                {agent.totalFiles === 1 ? 'file' : 'files'}
              </span>
              {agent.children.length > 0 && (
                <span className="rounded-full bg-ink-100 px-3 py-1 text-ink-600">
                  {agent.children.length} sub-agents
                </span>
              )}
              {agent.mentalModels.length > 0 && (
                <span className="rounded-full bg-ink-100 px-3 py-1 text-ink-600">
                  {agent.mentalModels.length} mental models
                </span>
              )}
            </div>
          </div>

          {agent.bank?.retain_mission && (
            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-ink-600">
              {agent.bank.retain_mission}
            </p>
          )}
          {agent.mentalModels.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {agent.mentalModels.map((m) => (
                <span
                  key={m.id}
                  className="rounded-md bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-600"
                >
                  {m.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Install */}
      <section className="border-b border-ink-200 bg-ink-50">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <h2 className="text-xl font-semibold text-ink-900">Install</h2>
          <p className="mt-1 text-sm text-ink-500">
            Pick the harness that matches where you'll chat with the agent.
            Need details? See the{' '}
            <Link
              href={link('/harnesses')}
              className="font-medium text-accent-600 hover:underline"
            >
              harness pages
            </Link>
            .
          </p>

          <div className="mt-5 max-w-3xl">
            <HarnessCodeBlock template={installTemplate} />
          </div>
        </div>
      </section>

      {/* Memory bank */}
      {agent.bank && (
        <section className="border-b border-ink-200 bg-white">
          <div className="mx-auto max-w-5xl px-6 py-10">
            <h2 className="text-xl font-semibold text-ink-900">Memory bank</h2>
            <p className="mt-1 text-sm text-ink-500">
              How this agent thinks about its own memory.
            </p>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {agent.bank.observations_mission && (
                <div className="rounded-xl border border-ink-200 bg-ink-50 p-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-500">
                    Observations mission
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-700">
                    {agent.bank.observations_mission}
                  </p>
                </div>
              )}
              {agent.bank.retain_mission && (
                <div className="rounded-xl border border-ink-200 bg-ink-50 p-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-500">
                    Retain mission
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-700">
                    {agent.bank.retain_mission}
                  </p>
                </div>
              )}
            </div>

            {agent.mentalModels.length > 0 && (
              <div className="mt-8">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-500">
                  Mental models
                </h3>
                <div className="mt-3 space-y-3">
                  {agent.mentalModels.map((m) => (
                    <div
                      key={m.id}
                      className="rounded-lg border border-ink-200 bg-ink-50 p-4"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h4 className="font-semibold text-ink-900">{m.name}</h4>
                        <code className="text-xs text-ink-400">{m.id}</code>
                      </div>
                      {m.source_query && (
                        <p className="mt-2 text-sm leading-relaxed text-ink-600">
                          {m.source_query}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Sub-agents */}
      {agent.children.length > 0 && (
        <section className="border-b border-ink-200 bg-ink-50">
          <div className="mx-auto max-w-5xl px-6 py-10">
            <h2 className="text-xl font-semibold text-ink-900">Sub-agents</h2>
            <p className="mt-1 text-sm text-ink-500">
              Specialized templates inside{' '}
              <code className="rounded bg-ink-100 px-1 py-0.5">{agent.slug}</code>.
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {agent.children.map((c) => (
                <Link
                  key={c.slug}
                  href={link(`/agents/${c.slug}`)}
                  className="group rounded-xl border border-ink-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-accent-300"
                >
                  <div className="text-xs font-mono text-ink-400">{c.slug}</div>
                  <h3 className="mt-1 font-semibold text-ink-900 group-hover:text-accent-700">
                    {c.displayName}
                  </h3>
                  <p className="mt-1 text-xs text-ink-500">
                    {c.totalFiles} {c.totalFiles === 1 ? 'file' : 'files'}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Knowledge files */}
      {agent.files.length > 0 && (
        <section className="border-b border-ink-200 bg-white">
          <div className="mx-auto max-w-5xl px-6 py-10">
            <h2 className="text-xl font-semibold text-ink-900">Knowledge files</h2>
            <p className="mt-1 text-sm text-ink-500">
              Seed knowledge ingested when the agent is installed.
            </p>

            <div className="mt-5 space-y-4">
              {agent.files.map((f) => (
                <details
                  key={f.fileName}
                  className="group rounded-xl border border-ink-200 bg-ink-50 transition open:bg-white"
                >
                  <summary className="flex cursor-pointer list-none items-start gap-3 p-5">
                    <span
                      className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-base text-white"
                      style={{ backgroundColor: colorOf(f) }}
                      aria-hidden
                    >
                      {f.emoji ?? '◈'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="font-semibold text-ink-900">{f.name}</h3>
                        <code className="font-mono text-xs text-ink-400">
                          {f.fileName}
                        </code>
                      </div>
                      {f.description && (
                        <p className="mt-1 text-sm leading-relaxed text-ink-500">
                          {f.description}
                        </p>
                      )}
                      {f.vibe && (
                        <p className="mt-2 text-xs italic text-ink-400">
                          "{f.vibe}"
                        </p>
                      )}
                      {f.tools && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {f.tools.split(',').map((t) => (
                            <span
                              key={t}
                              className="rounded bg-ink-100 px-1.5 py-0.5 font-mono text-xs text-ink-600"
                            >
                              {t.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <span
                      className="shrink-0 self-center text-ink-400 transition group-open:rotate-180"
                      aria-hidden
                    >
                      ▾
                    </span>
                  </summary>
                  <div className="border-t border-ink-200 px-5 py-4">
                    <article
                      className="prose-doc"
                      dangerouslySetInnerHTML={{
                        __html: marked.parse(f.body, { async: false }) as string,
                      }}
                    />
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

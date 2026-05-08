import type { Metadata } from 'next';
import {
  AgentSearch,
  type AgentCardData,
} from '@/components/AgentSearch';
import { loadRoots, flattenAgents, type AgentNode } from '@/lib/agents';
import { link } from '@/lib/link';

export const metadata: Metadata = {
  title: 'Agents',
  description:
    'Browse self-driving agent templates. Search across every department, specialist, and knowledge file.',
};

function searchText(a: AgentNode): string {
  const parts: string[] = [
    a.slug,
    a.displayName,
    a.bank?.observations_mission ?? '',
    a.bank?.retain_mission ?? '',
    a.children.map((c) => c.displayName).join(' '),
    a.files.map((f) => `${f.name} ${f.description}`).join(' '),
    a.mentalModels.map((m) => m.name).join(' '),
  ];
  return parts.join(' ').toLowerCase();
}

export default function AgentsIndexPage() {
  const all = flattenAgents(loadRoots());
  const cards: AgentCardData[] = all.map((a) => ({
    slug: a.slug,
    href: link(`/agents/${a.slug}`),
    displayName: a.displayName,
    totalFiles: a.totalFiles,
    search: searchText(a),
    isTopLevel: a.segments.length === 1,
    mission: a.bank?.retain_mission ?? '',
    childrenNames: a.children.map((c) => c.displayName),
    mentalModelNames: a.mentalModels.map((m) => m.name),
  }));

  return (
    <>
      <section className="border-b border-ink-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <p className="text-sm font-medium uppercase tracking-wide text-accent-600">
            Templates
          </p>
          <h1 className="mt-2 text-3xl font-bold text-ink-900 sm:text-4xl">
            Available agents
          </h1>
          <p className="mt-3 max-w-2xl text-ink-500">
            Top-level departments are listed below. Use search to drill into
            specialists, knowledge files, or mental models.
          </p>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-6 py-10">
          <AgentSearch cards={cards} />
        </div>
      </section>
    </>
  );
}

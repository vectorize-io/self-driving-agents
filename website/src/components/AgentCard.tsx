import Link from 'next/link';
import type { AgentNode } from '@/lib/agents';

interface Props {
  agent: AgentNode;
  href: string;
}

export function AgentCard({ agent, href }: Props) {
  const mission = agent.bank?.retain_mission ?? '';
  const trimmedMission =
    mission.length > 200 ? mission.slice(0, 197).trimEnd() + '…' : mission;
  const modelNames = agent.mentalModels.map((m) => m.name);

  return (
    <Link
      href={href}
      className="group flex flex-col rounded-xl border border-ink-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-accent-300 hover:shadow-md"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-xs text-ink-400">{agent.slug}</span>
        <span className="rounded-full bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-500">
          {agent.totalFiles} {agent.totalFiles === 1 ? 'file' : 'files'}
        </span>
      </div>
      <h3 className="text-lg font-semibold text-ink-900 group-hover:text-accent-700">
        {agent.displayName}
      </h3>
      {trimmedMission && (
        <p className="mt-2 text-sm leading-relaxed text-ink-500">
          {trimmedMission}
        </p>
      )}
      {agent.children.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {agent.children.map((c) => (
            <span
              key={c.slug}
              className="rounded-md bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-600"
            >
              {c.displayName}
            </span>
          ))}
        </div>
      ) : modelNames.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {modelNames.map((name) => (
            <span
              key={name}
              className="rounded-md bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-600"
            >
              {name}
            </span>
          ))}
        </div>
      ) : null}
    </Link>
  );
}

'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

export interface AgentCardData {
  slug: string;
  href: string;
  displayName: string;
  totalFiles: number;
  /** lower-cased haystack: name, slug, mission, file names, etc. */
  search: string;
  isTopLevel: boolean;
  /** observations_mission — what this agent watches for. */
  mission: string;
  childrenNames: string[];
  mentalModelNames: string[];
}

interface Props {
  cards: AgentCardData[];
}

export function AgentSearch({ cards }: Props) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const totalCount = cards.length;
  const topLevelCount = useMemo(
    () => cards.filter((c) => c.isTopLevel).length,
    [cards],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cards.filter((c) => c.isTopLevel);
    return cards.filter((c) => c.search.includes(q));
  }, [cards, query]);

  // Slash to focus
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        const tag = (document.activeElement?.tagName ?? '').toLowerCase();
        if (tag === 'input' || tag === 'textarea') return;
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const counterLabel = query.trim()
    ? visible.length === 0
      ? `No match in ${totalCount}`
      : `${visible.length} match${visible.length === 1 ? '' : 'es'} in ${totalCount}`
    : `Showing ${topLevelCount} of ${totalCount}`;

  return (
    <>
      <div className="sticky top-14 z-10 -mx-2 mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-ink-200 bg-white/95 p-3 shadow-sm backdrop-blur">
        <div className="relative flex-1 min-w-[220px]">
          <span
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
            aria-hidden
          >
            ⌕
          </span>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search agents, files, missions…"
            className="w-full rounded-lg border border-ink-200 bg-ink-50 py-2 pl-9 pr-3 text-sm text-ink-800 placeholder-ink-400 outline-none transition focus:border-accent-400 focus:bg-white focus:ring-2 focus:ring-accent-200"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-ink-500">
          <span>{counterLabel}</span>
          {query.trim() && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="rounded-md border border-ink-200 bg-white px-2 py-1 font-medium text-ink-600 transition hover:border-ink-300"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-ink-200 bg-ink-50 p-10 text-center">
          <p className="text-sm font-semibold text-ink-700">No matches.</p>
          <p className="mt-1 text-sm text-ink-500">
            Try a different keyword, or clear the search to see all top-level
            agents.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((c) => {
            const trimmed =
              c.mission.length > 200
                ? c.mission.slice(0, 197).trimEnd() + '…'
                : c.mission;
            return (
              <Link
                key={c.slug}
                href={c.href}
                className="group flex flex-col rounded-xl border border-ink-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-accent-300 hover:shadow-md"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono text-xs text-ink-400">{c.slug}</span>
                  <span className="rounded-full bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-500">
                    {c.totalFiles} {c.totalFiles === 1 ? 'file' : 'files'}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-ink-900 group-hover:text-accent-700">
                  {c.displayName}
                </h3>
                {trimmed && (
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">
                    {trimmed}
                  </p>
                )}
                {c.childrenNames.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {c.childrenNames.map((name) => (
                      <span
                        key={name}
                        className="rounded-md bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-600"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                ) : c.mentalModelNames.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {c.mentalModelNames.map((name) => (
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
          })}
        </div>
      )}
    </>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { asset } from '@/lib/link';
import { HARNESSES } from '@/lib/harnesses';

interface Props {
  /**
   * Code template containing the literal token `{harness}` wherever the
   * selected harness slug should be substituted. Plain string so it can
   * cross the server → client boundary in Next.js App Router (functions
   * can't).
   *
   * Example: `npx ... install my-agent --harness {harness} --empty`
   */
  template: string;
  /**
   * Optional initial harness. Falls back to the persisted choice in
   * localStorage, then to the first harness in `HARNESSES`.
   */
  defaultHarness?: string;
}

const STORAGE_KEY = 'sda:preferred-harness';

export function HarnessCodeBlock({ template, defaultHarness }: Props) {
  // Initialise with a deterministic value so SSR + first client render
  // agree (no localStorage on the server). Hydrate from localStorage in an
  // effect on mount.
  const fallback =
    defaultHarness ??
    (HARNESSES[0]?.slug ?? 'claude-code');
  const [slug, setSlug] = useState<string>(fallback);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Hydrate the persisted choice after mount.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved && HARNESSES.some((h) => h.slug === saved)) {
        setSlug(saved);
      }
    } catch {
      /* localStorage unavailable */
    }
  }, []);

  // Click-outside closes the picker.
  useEffect(() => {
    if (!pickerOpen) return;
    function onMouseDown(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setPickerOpen(false);
    }
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [pickerOpen]);

  function selectHarness(s: string) {
    setSlug(s);
    setPickerOpen(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, s);
      window.dispatchEvent(
        new StorageEvent('storage', { key: STORAGE_KEY, newValue: s }),
      );
    } catch {
      /* ignore */
    }
  }

  // Sync across siblings on the same page (selecting in one block updates
  // every other HarnessCodeBlock).
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== STORAGE_KEY || !e.newValue) return;
      if (HARNESSES.some((h) => h.slug === e.newValue)) {
        setSlug(e.newValue);
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const harness = HARNESSES.find((h) => h.slug === slug) ?? HARNESSES[0];
  const code = template.replaceAll('{harness}', harness.slug);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }

  return (
    // No `overflow-hidden` here — the picker dropdown lives inside this
    // wrapper as an absolute element and needs to escape the bounds.
    // We drop the alpha on the header so the corner rounding still reads
    // cleanly without clipping.
    <div className="relative rounded-lg bg-ink-900 ring-1 ring-ink-800/80 shadow-sm">
      {/* Header strip: picker on the left, copy button on the right */}
      <div className="flex items-center justify-between rounded-t-lg border-b border-ink-800/80 bg-ink-900 px-2 py-1.5">
        <div className="relative" ref={pickerRef}>
          <button
            type="button"
            onClick={() => setPickerOpen((v) => !v)}
            aria-expanded={pickerOpen}
            aria-haspopup="listbox"
            className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs font-medium text-ink-200 transition hover:bg-ink-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
          >
            <HarnessIcon slug={harness.slug} logo={harness.logo} />
            <span>{harness.name}</span>
            <Chevron rotated={pickerOpen} />
          </button>

          {pickerOpen && (
            <ul
              role="listbox"
              className="absolute left-0 top-9 z-20 min-w-[200px] overflow-hidden rounded-lg bg-ink-900 ring-1 ring-ink-700 shadow-xl"
            >
              {HARNESSES.map((h) => (
                <li key={h.slug}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={h.slug === slug}
                    onClick={() => selectHarness(h.slug)}
                    className={
                      'flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition ' +
                      (h.slug === slug
                        ? 'bg-ink-800 text-ink-50'
                        : 'text-ink-300 hover:bg-ink-800 hover:text-ink-50')
                    }
                  >
                    <HarnessIcon slug={h.slug} logo={h.logo} />
                    <span>{h.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? 'Copied to clipboard' : 'Copy code'}
          title={copied ? 'Copied' : 'Copy'}
          className={
            'inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 ' +
            (copied
              ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30'
              : 'text-ink-300 hover:bg-ink-800 hover:text-ink-50')
          }
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
          <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      <pre className="overflow-x-auto whitespace-pre rounded-b-lg px-4 py-3 text-sm leading-relaxed text-ink-100">
        <code data-lang="bash">{code}</code>
      </pre>
    </div>
  );
}

function HarnessIcon({ slug, logo }: { slug: string; logo: string }) {
  // White-tile background so the colored brand logos read clearly on the
  // dark code-block background. Slug isn't used for rendering — passed for
  // a stable key in the parent map.
  void slug;
  return (
    <span className="inline-flex h-4 w-4 items-center justify-center rounded-sm bg-white p-[1px]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={asset(logo)}
        alt=""
        className="h-full w-full object-contain"
        loading="lazy"
        decoding="async"
      />
    </span>
  );
}

function Chevron({ rotated }: { rotated: boolean }) {
  return (
    <svg
      className={'h-3 w-3 transition ' + (rotated ? 'rotate-180' : '')}
      viewBox="0 0 12 12"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M3 4.5 6 7.5 9 4.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M9 2a2 2 0 0 0-2 2v1H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-1h2a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H9Zm0 2h7v9h-2V7a2 2 0 0 0-2-2H9V4ZM5 7h7v9H5V7Z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.9 3.9 7.473-9.81a.75.75 0 0 1 1.05-.143Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

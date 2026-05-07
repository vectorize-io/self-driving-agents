'use client';

import { useState } from 'react';

interface Props {
  code: string;
  lang?: string;
  /** show language label (top-left). Defaults to true when lang isn't 'bash'. */
  showLang?: boolean;
}

export function CodeBlock({ code, lang = 'bash', showLang }: Props) {
  const [copied, setCopied] = useState(false);
  const displayLang = showLang ?? lang !== 'bash';

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable — silently no-op */
    }
  }

  return (
    <div className="group relative overflow-hidden rounded-lg bg-ink-900 ring-1 ring-ink-800/80 shadow-sm">
      {displayLang && (
        <span className="absolute left-3 top-2 select-none font-mono text-[0.7rem] uppercase tracking-wide text-ink-400">
          {lang}
        </span>
      )}
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? 'Copied to clipboard' : 'Copy code'}
        title={copied ? 'Copied' : 'Copy'}
        className={
          'absolute right-2 top-2 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 ' +
          (copied
            ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30'
            : 'bg-ink-800/80 text-ink-300 ring-1 ring-ink-700 hover:bg-ink-700 hover:text-ink-50')
        }
      >
        {copied ? (
          <>
            <CheckIcon />
            <span>Copied</span>
          </>
        ) : (
          <>
            <CopyIcon />
            <span className="opacity-0 transition group-hover:opacity-100 sm:opacity-100">
              Copy
            </span>
          </>
        )}
      </button>
      <pre
        className={
          'overflow-x-auto whitespace-pre py-3 pr-20 text-sm leading-relaxed text-ink-100 ' +
          (displayLang ? 'pl-4 pt-9' : 'pl-4 pt-3')
        }
      >
        <code data-lang={lang}>{code}</code>
      </pre>
    </div>
  );
}

function CopyIcon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M9 2a2 2 0 0 0-2 2v1H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-1h2a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H9Zm0 2h7v9h-2V7a2 2 0 0 0-2-2H9V4ZM5 7h7v9H5V7Z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.9 3.9 7.473-9.81a.75.75 0 0 1 1.05-.143Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

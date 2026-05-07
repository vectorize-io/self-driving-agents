import type { ReactNode } from 'react';

interface Props {
  text: string;
}

/**
 * Render a string as React nodes, turning each `backtick segment` into
 * inline <code> and each **double-asterisk segment** into <strong>. Lets us
 * keep markdown-style content in the data without pulling in a full parser.
 *
 * The split regex captures both forms; alternation order matters because we
 * test each segment for which marker it begins with.
 */
export function Inline({ text }: Props): ReactNode {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
          return (
            <code
              key={i}
              className="rounded bg-ink-100 px-1 py-0.5 font-mono text-[0.9em] text-ink-800"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
          return (
            <strong key={i} className="font-semibold text-ink-900">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

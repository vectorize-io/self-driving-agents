'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  /** Mermaid source. May contain raw <br/> — we render programmatically so DOM escaping is not a concern. */
  chart: string;
  /** Stable id used for the generated SVG element. */
  id?: string;
}

let didInit = false;

export function Mermaid({ chart, id = 'mermaid-diagram' }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      const target = ref.current;
      if (!target) return;
      try {
        const mermaid = (await import('mermaid')).default;
        if (!didInit) {
          mermaid.initialize({
            startOnLoad: false,
            theme: 'base',
            securityLevel: 'loose',
            fontFamily:
              'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
            themeVariables: {
              primaryColor: '#eef4ff',
              primaryTextColor: '#0d0d10',
              primaryBorderColor: '#3a5ef0',
              lineColor: '#52525c',
              tertiaryColor: '#f7f7f8',
            },
            flowchart: {
              htmlLabels: true,
              curve: 'basis',
              padding: 16,
              nodeSpacing: 32,
              rankSpacing: 36,
            },
          });
          didInit = true;
        }

        const { svg, bindFunctions } = await mermaid.render(`${id}-svg`, chart);
        if (cancelled || !ref.current) return;
        ref.current.innerHTML = svg;
        bindFunctions?.(ref.current);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('mermaid render failed', err);
        if (!cancelled) setError(String(err));
      }
    }

    void render();

    return () => {
      cancelled = true;
    };
  }, [chart, id]);

  if (error) {
    return (
      <pre className="whitespace-pre-wrap text-xs text-red-600">{error}</pre>
    );
  }

  return (
    <div
      ref={ref}
      className="flex min-h-[280px] items-center justify-center text-sm text-ink-400"
      aria-label="Diagram"
    >
      <span>Loading diagram…</span>
    </div>
  );
}

import { asset } from '@/lib/link';
import type { Harness } from '@/lib/harnesses';

interface Props {
  harness: Harness;
  size?: string;
  variant?: 'tile' | 'bare';
}

export function HarnessLogo({ harness, size = 'h-9 w-9', variant = 'tile' }: Props) {
  const containerCls =
    variant === 'tile'
      ? `inline-flex ${size} items-center justify-center rounded-lg border border-ink-200 bg-white p-1.5 shadow-sm`
      : `inline-flex ${size} items-center justify-center`;

  return (
    <span className={containerCls} aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={asset(harness.logo)}
        alt=""
        className="h-full w-full object-contain"
        loading="lazy"
        decoding="async"
      />
    </span>
  );
}

import Link from 'next/link';
import { link } from '@/lib/link';

const NAV = [
  { href: link('/'), label: 'Home' },
  { href: link('/concept'), label: 'Concept' },
  { href: link('/agents'), label: 'Agents' },
  { href: link('/harnesses'), label: 'Harnesses' },
  { href: link('/create'), label: 'Create your own' },
];

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-ink-200 bg-ink-50/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link
          href={link('/')}
          className="flex items-center gap-2 font-semibold text-ink-900"
        >
          <span
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent-500 text-ink-50 shadow-sm"
            aria-hidden
          >
            ◈
          </span>
          <span className="text-base">Self-Driving Agents</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-ink-500 transition hover:bg-ink-100 hover:text-ink-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <a
          href="https://github.com/vectorize-io/self-driving-agents"
          target="_blank"
          rel="noopener"
          className="rounded-md border border-ink-200 bg-white px-3 py-1.5 text-sm font-medium text-ink-700 transition hover:border-ink-300 hover:bg-ink-50"
        >
          GitHub →
        </a>
      </div>
    </header>
  );
}

import Link from 'next/link';
import { link } from '@/lib/link';

export function Footer() {
  return (
    <footer className="border-t border-ink-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-6 py-8 text-sm text-ink-500 md:flex-row md:items-center">
        <div className="flex flex-col gap-1">
          <span className="font-medium text-ink-700">Self-Driving Agents</span>
          <span>
            Built on top of{' '}
            <a
              href="https://github.com/vectorize-io/hindsight"
              className="text-accent-600 hover:underline"
            >
              Hindsight
            </a>
            {' '}— portable memory for AI agents.
          </span>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Link href={link('/concepts')} className="hover:text-ink-900">
            Concepts
          </Link>
          <Link href={link('/agents')} className="hover:text-ink-900">
            Agents
          </Link>
          <Link href={link('/harnesses')} className="hover:text-ink-900">
            Harnesses
          </Link>
          <a
            href="https://github.com/vectorize-io/self-driving-agents"
            className="hover:text-ink-900"
            target="_blank"
            rel="noopener"
          >
            GitHub
          </a>
          <a
            href="https://www.npmjs.com/package/@vectorize-io/self-driving-agents"
            className="hover:text-ink-900"
            target="_blank"
            rel="noopener"
          >
            npm
          </a>
        </div>
      </div>
    </footer>
  );
}

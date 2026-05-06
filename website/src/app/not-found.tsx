import Link from 'next/link';
import { link } from '@/lib/link';

export default function NotFound() {
  return (
    <section className="bg-white">
      <div className="mx-auto flex min-h-[60dvh] max-w-3xl flex-col items-start justify-center px-6 py-20">
        <p className="text-sm font-medium uppercase tracking-wide text-accent-600">
          404
        </p>
        <h1 className="mt-2 text-3xl font-bold text-ink-900 sm:text-4xl">
          Not found
        </h1>
        <p className="mt-3 text-ink-500">
          That page does not exist. Try one of these instead:
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={link('/')}
            className="rounded-lg border border-ink-200 bg-ink-50 px-4 py-2 text-sm font-medium text-ink-700 hover:border-ink-300"
          >
            Home
          </Link>
          <Link
            href={link('/agents')}
            className="rounded-lg border border-ink-200 bg-ink-50 px-4 py-2 text-sm font-medium text-ink-700 hover:border-ink-300"
          >
            Agents
          </Link>
          <Link
            href={link('/harnesses')}
            className="rounded-lg border border-ink-200 bg-ink-50 px-4 py-2 text-sm font-medium text-ink-700 hover:border-ink-300"
          >
            Harnesses
          </Link>
        </div>
      </div>
    </section>
  );
}

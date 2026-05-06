interface Props {
  code: string;
  lang?: string;
}

export function CodeBlock({ code, lang = 'bash' }: Props) {
  return (
    <pre className="overflow-x-auto rounded-lg bg-ink-900 px-4 py-3 text-sm text-ink-100">
      <code data-lang={lang}>{code}</code>
    </pre>
  );
}

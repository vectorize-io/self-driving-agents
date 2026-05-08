import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const ROOT = path.resolve(process.cwd(), '..');

/**
 * Top-level repo dirs that are NOT agent templates and should be skipped
 * when auto-discovering. Anything else with a bank-template.json shows up.
 */
const SKIP_AT_ROOT = new Set([
  'node_modules',
  'dist',
  'website',
  'src',
  'public',
  '.git',
  '.github',
  '.next',
  '.vscode',
  '.idea',
]);

export interface AgentFile {
  fileName: string;
  slug: string;
  name: string;
  description: string;
  emoji: string | null;
  color: string | null;
  vibe: string | null;
  tools: string | null;
  body: string;
}

export interface BankTemplate {
  observations_mission?: string;
  retain_mission?: string;
  enable_observations?: boolean;
}

export interface MentalModel {
  id: string;
  name: string;
  source_query?: string;
  max_tokens?: number;
}

export interface AgentNode {
  segments: string[];
  slug: string;
  key: string;
  displayName: string;
  bank: BankTemplate | null;
  mentalModels: MentalModel[];
  files: AgentFile[];
  children: AgentNode[];
  totalFiles: number;
}

const TITLE_OVERRIDES: Record<string, string> = {
  marketing: 'Marketing',
  seo: 'SEO',
  'social-media': 'Social Media',
  'china-market': 'China Market',
  ecommerce: 'E-Commerce',
  content: 'Content',
};

function toDisplayName(key: string): string {
  if (TITLE_OVERRIDES[key]) return TITLE_OVERRIDES[key];
  return key
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
}

function safeReadJson<T>(file: string): T | null {
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8')) as T;
  } catch {
    return null;
  }
}

function loadFile(filePath: string): AgentFile {
  const raw = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath);
  const slug = fileName.replace(/\.(md|txt)$/i, '');
  let parsed: matter.GrayMatterFile<string>;
  try {
    parsed = matter(raw);
  } catch {
    parsed = { data: {}, content: raw } as matter.GrayMatterFile<string>;
  }
  const data = parsed.data as Record<string, unknown>;
  return {
    fileName,
    slug,
    name: typeof data.name === 'string' ? data.name : toDisplayName(slug),
    description: typeof data.description === 'string' ? data.description : '',
    emoji: typeof data.emoji === 'string' ? data.emoji : null,
    color: typeof data.color === 'string' ? data.color : null,
    vibe: typeof data.vibe === 'string' ? data.vibe : null,
    tools: typeof data.tools === 'string' ? data.tools : null,
    body: parsed.content,
  };
}

function buildNode(absDir: string, segments: string[]): AgentNode | null {
  const stat = fs.statSync(absDir);
  if (!stat.isDirectory()) return null;

  const bankTemplatePath = path.join(absDir, 'bank-template.json');
  const tpl = safeReadJson<{
    bank?: BankTemplate;
    mental_models?: MentalModel[];
  }>(bankTemplatePath);
  if (!tpl) return null;

  const entries = fs.readdirSync(absDir, { withFileTypes: true });

  const files: AgentFile[] = entries
    .filter((e) => e.isFile() && /\.(md|txt)$/i.test(e.name))
    .map((e) => loadFile(path.join(absDir, e.name)))
    .sort((a, b) => a.name.localeCompare(b.name));

  const children: AgentNode[] = [];
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    if (e.name.startsWith('.') || e.name === 'node_modules') continue;
    const child = buildNode(path.join(absDir, e.name), [...segments, e.name]);
    if (child) children.push(child);
  }
  children.sort((a, b) => a.key.localeCompare(b.key));

  const key = segments[segments.length - 1] ?? path.basename(absDir);
  const totalFiles = files.length + children.reduce((acc, c) => acc + c.totalFiles, 0);

  return {
    segments,
    slug: segments.join('/'),
    key,
    displayName: toDisplayName(key),
    bank: tpl.bank ?? null,
    mentalModels: tpl.mental_models ?? [],
    files,
    children,
    totalFiles,
  };
}

let cachedRoots: AgentNode[] | null = null;

/**
 * Discover top-level agent templates by scanning the repo root for any
 * directory containing a bank-template.json. Each match becomes a top-level
 * agent and its subtree is loaded recursively.
 */
export function loadRoots(): AgentNode[] {
  if (cachedRoots) return cachedRoots;
  const entries = fs.readdirSync(ROOT, { withFileTypes: true });
  const roots: AgentNode[] = [];
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    if (e.name.startsWith('.') || SKIP_AT_ROOT.has(e.name)) continue;
    const node = buildNode(path.join(ROOT, e.name), [e.name]);
    if (node) roots.push(node);
  }
  roots.sort((a, b) => a.key.localeCompare(b.key));
  cachedRoots = roots;
  return roots;
}

export function flattenAgents(roots: AgentNode[] = loadRoots()): AgentNode[] {
  const out: AgentNode[] = [];
  const walk = (n: AgentNode) => {
    out.push(n);
    for (const c of n.children) walk(c);
  };
  for (const r of roots) walk(r);
  return out;
}

export function findAgent(slug: string): AgentNode | undefined {
  return flattenAgents().find((n) => n.slug === slug);
}

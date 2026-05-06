export interface Harness {
  slug: string;
  name: string;
  tagline: string;
  flag: string;
  /** short summary of the harness */
  intro: string;
  /** marketing copy: who it's for */
  audience: string;
  /** install steps as ordered list */
  steps: { title: string; body: string; code?: string }[];
  /** how it works under the hood */
  howItWorks: string[];
  /** external links */
  links: { label: string; href: string }[];
  color: string;
}

export const HARNESSES: Harness[] = [
  {
    slug: 'claude',
    name: 'Claude Chat & Cowork',
    tagline:
      'Drop a self-contained skill into claude.ai or Cowork. No backend required.',
    flag: '--harness claude',
    intro:
      'The Claude harness packages an agent as a Claude skill: a zip you upload through the UI. Once uploaded, type /<agent-name> in any conversation to activate it.',
    audience:
      'Use this harness if you work in claude.ai (Pro/Team/Enterprise) or Claude Cowork and want self-driving agents that learn from every conversation.',
    steps: [
      {
        title: 'Install an agent',
        body: 'Run the CLI and answer the prompts (Hindsight Cloud or self-hosted, API URL, token).',
        code: 'npx @vectorize-io/self-driving-agents install marketing/seo --harness claude',
      },
      {
        title: 'Upload the skill zip',
        body: 'The CLI generates a self-contained skill zip. In Claude.ai, go to Customize → Skills → Upload and select the file.',
      },
      {
        title: 'Allowlist the API host',
        body: 'In Settings → Capabilities, allow the Hindsight API host (e.g. api.hindsight.vectorize.io). Skills use curl to talk to Hindsight.',
      },
      {
        title: 'Activate the agent',
        body: 'Start a new conversation and type the agent slash command (e.g. /seo-specialist) to load it.',
      },
    ],
    howItWorks: [
      'The CLI fetches the agent directory and reads bank-template.json.',
      'It connects to Hindsight, creates a memory bank, and ingests the bundled .md files as seed knowledge.',
      'A skill zip is generated with the bank ID and API token baked in — no external dependencies.',
      'When you invoke the skill, Claude loads the latest knowledge pages, retains feedback during the conversation, and updates pages after the session.',
    ],
    links: [
      { label: 'Claude.ai', href: 'https://claude.ai' },
      { label: 'Claude Skills docs', href: 'https://support.anthropic.com/' },
    ],
    color: '#D97706',
  },
  {
    slug: 'openclaw',
    name: 'OpenClaw',
    tagline:
      'Open-source agent gateway. The CLI installs the Hindsight plugin and registers a workspace.',
    flag: '--harness openclaw',
    intro:
      'OpenClaw is an open-source agent runtime. The CLI installs the Hindsight plugin into your gateway, creates a workspace from the agent template, and registers the agent so it shows up immediately.',
    audience:
      'Use this harness if you self-host an agent gateway and want full control over routing, tools, and policy.',
    steps: [
      {
        title: 'Install the agent',
        body: 'Run the CLI and pick OpenClaw as the harness. Provide your gateway URL and admin token when prompted.',
        code: 'npx @vectorize-io/self-driving-agents install marketing/seo --harness openclaw',
      },
      {
        title: 'Restart the gateway',
        body: 'OpenClaw needs a restart to pick up the new plugin and workspace.',
      },
      {
        title: 'Start chatting',
        body: 'The agent appears in your OpenClaw UI under the workspace name. Open it and start a conversation — memory is updated automatically after each session.',
      },
    ],
    howItWorks: [
      'The CLI installs @vectorize-io/hindsight-openclaw-plugin into your OpenClaw gateway.',
      'It creates an OpenClaw workspace mapped to the Hindsight bank for this agent.',
      'Knowledge pages from bank-template.json are exposed to the agent as tools — load_knowledge, retain_message, manage_pages.',
      'The seed .md files are ingested as initial facts so the agent ships with prior knowledge instead of starting blank.',
    ],
    links: [
      { label: 'OpenClaw', href: 'https://openclaw.dev' },
      {
        label: 'Hindsight plugin',
        href: 'https://www.npmjs.com/package/@vectorize-io/hindsight-openclaw-plugin',
      },
    ],
    color: '#059669',
  },
  {
    slug: 'nemoclaw',
    name: 'NemoClaw',
    tagline:
      'NVIDIA NeMo Agent runtime — same install flow, same self-driving behavior.',
    flag: '--harness nemoclaw',
    intro:
      'NemoClaw runs on NVIDIA NeMo Agent. The CLI takes care of plugin install, workspace creation, and agent registration so you can focus on the conversation.',
    audience:
      'Use this harness if you run on the NeMo Agent stack and want portable memory across NeMo deployments.',
    steps: [
      {
        title: 'Install the agent',
        body: 'Run the CLI and pick NemoClaw as the harness. Provide your gateway URL and token when prompted.',
        code: 'npx @vectorize-io/self-driving-agents install marketing/seo --harness nemoclaw',
      },
      {
        title: 'Restart the gateway',
        body: 'NemoClaw needs a restart to pick up the new plugin and workspace.',
      },
      {
        title: 'Start chatting',
        body: 'The agent shows up in NemoClaw under the workspace name. Conversations are retained into memory automatically.',
      },
    ],
    howItWorks: [
      'The CLI installs the Hindsight NemoClaw plugin into your gateway.',
      'A NeMo workspace is created and bound to the Hindsight bank.',
      'Seed knowledge from the agent directory is ingested before the first conversation.',
      'Knowledge pages are kept up to date by Hindsight as the agent runs.',
    ],
    links: [
      { label: 'NVIDIA NeMo Agent', href: 'https://github.com/NVIDIA/NeMo-Agent' },
    ],
    color: '#76B900',
  },
];

export function findHarness(slug: string): Harness | undefined {
  return HARNESSES.find((h) => h.slug === slug);
}

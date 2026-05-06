export interface Harness {
  slug: string;
  name: string;
  tagline: string;
  flag: string;
  intro: string;
  audience: string;
  steps: { title: string; body: string; code?: string }[];
  howItWorks: string[];
  bankMapping: { summary: string; details: string[] };
  links: { label: string; href: string }[];
  color: string;
  /** path under /public, no leading slash */
  logo: string;
  wordmark?: string;
}

export const HARNESSES: Harness[] = [
  {
    slug: 'claude-code',
    name: 'Claude Code',
    tagline:
      'Anthropic\'s Claude Code CLI plus the Hindsight MCP server. No skill upload, no gateway.',
    flag: '--harness claude-code',
    intro:
      'The claude-code harness pairs the Claude Code CLI with the Hindsight MCP server. The self-driving-agents CLI stages the agent files locally, auto-approves the Hindsight tools and create-agent skill in your Claude Code settings, and prints a one-line prompt you paste to finish the install.',
    audience:
      'Use this harness if you already use Claude Code in your terminal and want a self-driving agent backed by Hindsight memory — no skill zip, no separate gateway.',
    steps: [
      {
        title: 'Install the agent',
        body: 'The CLI copies the template content to ~/.self-driving-agents/claude-code/<agent>/ and updates ~/.claude/settings.json to allow the Hindsight MCP tools, the create-agent skill, and read-only Bash on the staged dir.',
        code: 'npx @vectorize-io/self-driving-agents install marketing/seo --harness claude-code',
      },
      {
        title: 'Make sure the Hindsight plugin is installed',
        body:
          'Claude Code reaches Hindsight via the hindsight-memory plugin (MCP server + create-agent skill). Install it once and you\'re set for every agent.',
      },
      {
        title: 'Start Claude Code and paste the printed prompt',
        body:
          'Open Claude Code in any project. Paste the prompt the CLI printed at the end of install — it tells Claude to run /hindsight-memory:create-agent, ingest the staged files, and create the mental models declared in bank-template.json.',
        code:
          'Use /hindsight-memory:create-agent to create a "marketing-seo" agent. Then ingest all files from ~/.self-driving-agents/claude-code/marketing-seo/ (skip bank-template.json). Read ~/.self-driving-agents/claude-code/marketing-seo/bank-template.json and create the exact mental models (knowledge pages) defined in its "mental_models" array using agent_knowledge_create_page for each one.',
      },
    ],
    howItWorks: [
      'The CLI stages every .md/.txt plus bank-template.json under ~/.self-driving-agents/claude-code/<agent>/.',
      'Your ~/.claude/settings.json gets allowedTools entries for mcp__hindsight__*, Skill(hindsight-memory:create-agent), and Bash(ls/cat ~/.self-driving-agents/*) so the next steps run without approval prompts.',
      'When you run the printed prompt, the create-agent skill provisions the Hindsight bank, ingests the staged content as seed knowledge, and creates one knowledge page per mental_model from bank-template.json.',
      'From then on, the agent uses the Hindsight MCP tools to load pages at session start, retain feedback during the chat, and update its own pages after the conversation ends.',
    ],
    bankMapping: {
      summary:
        'The bank is provisioned by /hindsight-memory:create-agent against the Hindsight account configured in Claude Code\'s MCP server.',
      details: [
        'The Hindsight MCP server in Claude Code is the single source of truth for which Hindsight tenant is used — point it at Cloud or your self-hosted instance before running the prompt.',
        'By default the create-agent skill names the bank after the agent (e.g. marketing-seo). To use a different name, edit the agent name in the prompt the CLI printed before pasting it.',
        'To re-map an existing agent to a different bank, run /hindsight-memory:create-agent again with the new name — the staged files at ~/.self-driving-agents/claude-code/<agent>/ are reused.',
      ],
    },
    links: [
      { label: 'Claude Code', href: 'https://docs.anthropic.com/en/docs/claude-code' },
      { label: 'Hindsight', href: 'https://github.com/vectorize-io/hindsight' },
    ],
    color: '#D97757',
    logo: 'logos/claude.svg',
  },
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
    bankMapping: {
      summary:
        'The Hindsight API URL, API token, and bank ID are baked into the generated skill zip at install time. The CLI prompts for all three.',
      details: [
        'During install you pick Cloud (api.hindsight.vectorize.io) or self-hosted, paste an API token, and choose a Bank ID — defaulted to the agent name (e.g. marketing-seo).',
        'Those values are written into the skill\'s SKILL.md and called via curl from the skill at runtime. There is no in-Claude config — re-binding requires regenerating and re-uploading the zip.',
        'To re-map the agent to a different bank: re-run the CLI with --harness claude, enter the new bank ID, and upload the regenerated zip via Customize → Skills.',
        'Self-hosted Hindsight must be publicly reachable from Claude\'s servers — localhost URLs are rejected at install time.',
      ],
    },
    links: [
      { label: 'Claude.ai', href: 'https://claude.ai' },
      { label: 'Claude Skills docs', href: 'https://support.anthropic.com/' },
    ],
    color: '#D97757',
    logo: 'logos/claude.svg',
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
    bankMapping: {
      summary:
        'The hindsight-openclaw plugin holds the Hindsight connection. By default each OpenClaw workspace maps 1:1 to a Hindsight bank named after the workspace.',
      details: [
        'Connection lives under plugins.entries["hindsight-openclaw"].config in your OpenClaw config — fields hindsightApiUrl, hindsightApiToken, and bank-resolution settings.',
        'In dynamic mode (default), bank ID = workspace name, optionally with bankIdPrefix. Set dynamicBankId: false plus bankId: <fixed> to share one bank across multiple workspaces.',
        'The first --harness openclaw install runs the plugin\'s setup wizard; subsequent installs reuse the same connection and just add a new workspace.',
        'To re-map: edit the plugin config and restart the gateway, or re-run the wizard via npx --yes --package @vectorize-io/hindsight-openclaw hindsight-openclaw-setup.',
      ],
    },
    links: [
      { label: 'OpenClaw', href: 'https://github.com/openclaw/openclaw' },
      {
        label: 'Hindsight plugin',
        href: 'https://www.npmjs.com/package/@vectorize-io/hindsight-openclaw-plugin',
      },
    ],
    color: '#E26B3A',
    logo: 'logos/openclaw.svg',
    wordmark: 'logos/openclaw-wordmark.svg',
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
    bankMapping: {
      summary:
        'The hindsight-nemoclaw plugin holds the Hindsight connection per sandbox. Bank IDs are namespaced with a configurable prefix (default: "nemoclaw").',
      details: [
        'The setup wizard (npx --yes --package @vectorize-io/hindsight-nemoclaw hindsight-nemoclaw setup --sandbox <name>) writes hindsightApiUrl and hindsightApiToken into the sandbox\'s plugin config. Run it once per sandbox.',
        'Bank ID resolves as <bankIdPrefix>-<workspace>; the default prefix is "nemoclaw" so a workspace called marketing-seo lands in bank nemoclaw-marketing-seo. Override bankIdPrefix in plugin config to group sandboxes.',
        'Subsequent installs into the same sandbox reuse the existing connection without re-prompting.',
        'To re-map: edit plugin config (or re-run the setup wizard) and restart the NemoClaw gateway.',
      ],
    },
    links: [
      { label: 'NVIDIA NeMo Agent', href: 'https://github.com/NVIDIA/NeMo-Agent' },
    ],
    color: '#76B900',
    logo: 'logos/nvidia.svg',
  },
];

export function findHarness(slug: string): Harness | undefined {
  return HARNESSES.find((h) => h.slug === slug);
}

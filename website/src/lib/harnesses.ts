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
      'Anthropic\'s Claude Code CLI with the Hindsight Memory plugin — auto-recall, auto-retain, and the agent_knowledge_* tools, all wired in.',
    flag: '--harness claude-code',
    intro:
      'The claude-code harness drops the Hindsight Memory plugin into Claude Code. The plugin\'s hooks auto-recall relevant memories before every user prompt and auto-retain the conversation after every response; its MCP server exposes the agent_knowledge_* tools for managing pages and ingesting content. The self-driving-agents CLI takes care of installing the plugin, configuring the Hindsight connection, staging seed content, and allowlisting the right tools.',
    audience:
      'Use this harness if you already use Claude Code in your terminal and want a self-driving agent backed by Hindsight memory — no skill zip, no separate gateway.',
    steps: [
      {
        title: 'Install the agent',
        body:
          'Verifies `claude` is on PATH; adds the `vectorize-io/hindsight` plugin marketplace and installs (or updates) the `hindsight-memory` plugin; prompts for your Hindsight connection if you don\'t already have one configured; writes plugin config to `~/.hindsight/claude-code.json`; stages content under `~/.self-driving-agents/claude-code/<agent>/`; allowlists the plugin tools and the create-agent skill in `~/.claude/settings.json`.',
        code: 'npx @vectorize-io/self-driving-agents install marketing/seo --harness claude-code',
      },
      {
        title: 'cd into the project directory the agent should be scoped to',
        body:
          'The bank is derived from `(agent_name, project_basename)` — the working directory at session start is part of the binding. Always start `claude` from the same project directory if you want this agent to keep the same memory across sessions.',
      },
      {
        title: 'Start Claude Code',
        body:
          'Run `claude` in that directory. The plugin\'s session-start hook health-checks Hindsight, so if the connection is wrong you\'ll see it immediately.',
        code: 'claude',
      },
      {
        title: 'Run the printed prompt',
        body:
          'The CLI printed a one-liner at the end of install. Pasting it triggers the create-agent skill, which writes a Claude Code subagent at `~/.claude/agents/<name>.md` wired up to the Hindsight MCP, ingests every staged file via `agent_knowledge_ingest_file`, and creates three initial knowledge pages.',
        code: '/hindsight-memory:create-agent marketing-seo from ~/.self-driving-agents/claude-code/marketing-seo',
      },
    ],
    howItWorks: [
      'The Hindsight Memory plugin is installed via Claude Code\'s plugin marketplace (`vectorize-io/hindsight` → `hindsight-memory`). It bundles four hooks, an MCP server, and the create-agent skill.',
      'Hooks: `SessionStart` runs a health check; `UserPromptSubmit` auto-recalls relevant memories and injects them as invisible `additionalContext`; `Stop` auto-retains the transcript with chunked retention (default: every 10 turns with 2-turn overlap); `SessionEnd` cleans up the auto-managed daemon if one was started.',
      'MCP server (stdio): exposes `agent_knowledge_list_pages`, `get_page`, `create_page`, `update_page`, `delete_page`, `recall`, `ingest`, `ingest_file`, and `get_current_bank`. The bank ID is auto-resolved at runtime — tools never take a `bank_id` parameter.',
      'Connection lives in `~/.hindsight/claude-code.json`. Three modes are supported: external Hindsight server (set `hindsightApiUrl` + `hindsightApiToken`), auto-managed local daemon (leave URL empty; the plugin starts `hindsight-embed` via `uvx` and uses an LLM key like `OPENAI_API_KEY` for fact extraction), or an existing local daemon.',
      'Tool/skill allowlist in `~/.claude/settings.json` under `permissions.allow`: `mcp__plugin_hindsight-memory_hindsight__*`, `Skill(hindsight-memory:create-agent)`, `Bash(ls ~/.self-driving-agents/*)`, `Bash(cat ~/.self-driving-agents/*)` — so the next steps run without approval prompts.',
    ],
    bankMapping: {
      summary:
        'Per-(agent, project) bank derivation. Same agent in two different project directories means two different banks. Plugin config and connection live in `~/.hindsight/claude-code.json`.',
      details: [
        'The CLI sets `dynamicBankId: true` and `dynamicBankGranularity: ["agent", "project"]` in `~/.hindsight/claude-code.json`. The plugin combines the agent name and the project basename (cwd) into the bank ID at runtime.',
        'It also sets `enableKnowledgeTools: true` so the MCP server exposes the `agent_knowledge_*` tools.',
        'Connection: `hindsightApiUrl` + `hindsightApiToken` in the same file (external Hindsight server). Leave the URL empty to run a local `hindsight-embed` daemon — that mode needs an LLM key (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, etc.) for fact extraction.',
        'To re-map: change the agent name or the project directory (creates a new bank), or edit `~/.hindsight/claude-code.json` directly. The CLI deliberately bails if it sees `dynamicBankId: false` plus a static `bankId` — that conflicts with self-driving-agents\' per-(agent, project) isolation.',
        'Auto-recall and auto-retain default to memory types `["world", "experience"]`. Observations are not pulled by default — they\'re the synthesised layer the refresh engine writes against.',
      ],
    },
    links: [
      { label: 'Claude Code', href: 'https://docs.anthropic.com/en/docs/claude-code' },
      {
        label: 'Hindsight Memory plugin',
        href: 'https://github.com/vectorize-io/hindsight/tree/main/integrations/claude-code',
      },
      { label: 'Hindsight', href: 'https://github.com/vectorize-io/hindsight' },
    ],
    color: '#D97757',
    logo: 'logos/claude.svg',
  },
  {
    slug: 'hermes',
    name: 'Hermes',
    tagline:
      'NousResearch\'s open-source agent runtime. Per-agent profiles with built-in auto-retain and direct page tools.',
    flag: '--harness hermes',
    intro:
      'Hermes runs locally and isolates each agent in its own profile. The CLI creates a Hermes profile for the agent, drops in the hindsight-sda plugin and the agent-knowledge skill, and switches the profile\'s memory provider to Hindsight so retain happens automatically as you chat.',
    audience:
      'Use this harness if you run hermes-agent on your own machine and want a self-driving agent with both background auto-retain and explicit knowledge-page tools.',
    steps: [
      {
        title: 'Install hermes-agent',
        body:
          'The CLI checks for the hermes binary on PATH and bails if it\'s missing. Install it once from NousResearch\'s install script, then any agent install can target it.',
        code:
          'curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash',
      },
      {
        title: 'Install the agent',
        body:
          'Run the CLI with --harness hermes. It creates (or reuses) a Hermes profile named after the agent, copies the hindsight-sda plugin into the profile, and writes the Hindsight connection into the profile config.',
        code: 'npx @vectorize-io/self-driving-agents install marketing/seo --harness hermes',
      },
      {
        title: 'Chat',
        body:
          'Start a session with the agent\'s profile. Memory retains in the background; the agent-knowledge skill is loaded so you can also work with knowledge pages directly.',
        code: 'hermes -p marketing-seo chat',
      },
    ],
    howItWorks: [
      'The CLI runs hermes profile create <agent> --clone (or reuses an existing profile) and reads the profile path from hermes profile show.',
      'It copies the hindsight-sda plugin (plugin.yaml + __init__.py) into <profile>/plugins/hindsight-sda/, and writes <profile>/hindsight/config.json with the API URL, token, and bank ID.',
      'It edits <profile>/config.yaml to set memory.provider: hindsight and add hindsight-sda to plugins.enabled — so the bundled Hindsight memory provider auto-retains during chat and the tool plugin exposes knowledge-page operations to the agent.',
      'Seed knowledge from the agent directory is ingested as initial memories, and the agent-knowledge skill is dropped into <profile>/skills/agent-knowledge/SKILL.md.',
    ],
    bankMapping: {
      summary:
        'Each Hermes profile maps 1:1 to one Hindsight bank. The bank ID equals the agent name (and the profile name). Connection lives in <profile>/hindsight/config.json.',
      details: [
        'The CLI writes <profile>/hindsight/config.json with mode, api_url, api_key, bank_id, recall_budget, and memory_mode. Both the bundled Hindsight memory provider and the hindsight-sda tool plugin read this same file — single source of truth.',
        'bank_id is set to the agent name and bank_id_template is left empty, so every chat in the profile lands in the same Hindsight bank. No dynamic per-thread banks.',
        'On install the CLI looks for an existing connection in this order: <profile>/../hindsight/config.json, then OpenClaw\'s plugin config, then prompts. Re-running the install with the same agent name reuses the profile and updates the config in place.',
        'To re-map: edit <profile>/hindsight/config.json (e.g. point at a different bank_id or api_url) — no restart of a daemon needed; hermes reads it at the next chat.',
      ],
    },
    links: [
      {
        label: 'hermes-agent on GitHub',
        href: 'https://github.com/NousResearch/hermes-agent',
      },
      {
        label: 'Hermes docs',
        href: 'https://hermes-agent.nousresearch.com/',
      },
    ],
    color: '#B8860B',
    logo: 'logos/hermes.svg',
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

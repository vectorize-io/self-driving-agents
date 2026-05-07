export interface Harness {
  slug: string;
  name: string;
  tagline: string;
  flag: string;

  /**
   * "What you get" — user-facing value of adding self-driving-agents to
   * this harness. Prose intro + bullet list. NO plugin names, file paths,
   * tool signatures, or other implementation detail here — those live in
   * `howItWorks` and `tools`.
   */
  whatYouGet: { intro: string; items: string[] };

  steps: { title: string; body: string; code?: string }[];

  /**
   * "How it works" prose — typically a single paragraph in the structured
   * shape. Each entry is rendered through `<Inline>` so backticks become
   * <code> and `**bold**` becomes <strong>.
   */
  howItWorks: string[];

  /**
   * Agent-facing tools rendered as a grid in "How it works". Each entry
   * is one row: `name` shown as inline code, `description` as short prose.
   */
  tools: { name: string; description: string }[];

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
      'Claude Code that learns from every project.',
    flag: '--harness claude-code',
    whatYouGet: {
      intro:
        'Claude Code in a project directory has no memory of prior sessions there — every conversation starts fresh. Self-driving agents make Claude get sharper over time on each project: it picks up the conventions, the patterns that work, and your corrections, and walks into the next session already knowing them.',
      items: [
        '**Learns from every conversation** — preferences, decisions, and recurring patterns from each project session feed forward to the next.',
        '**Builds its own playbooks** — the agent maintains long-form pages (a personal wiki) that self-rewrite from what it has learned in this project.',
        '**One agent per project directory** — same agent name in two different project dirs keeps its learning separate. Same dir means same memory.',
      ],
    },
    steps: [
      {
        title: 'Have Claude Code installed',
        body:
          'The CLI shells out to `claude plugin install` and writes to `~/.claude/settings.json`. Install Claude Code first if you haven\'t already.',
        code: 'npm install -g @anthropic-ai/claude-code',
      },
      {
        title: 'Install the agent',
        body:
          'One CLI call adds the marketplace, installs (or updates) the plugin, configures the connection (interactive on first run), stages seed content, and allowlists the right tools and skill.',
        code: 'npx @vectorize-io/self-driving-agents install marketing/seo --harness claude-code',
      },
      {
        title: 'cd into the project directory',
        body:
          'The agent\'s memory is scoped to the project directory — same agent in a different `cd` means a different bank. Always start `claude` from the same project dir.',
      },
      {
        title: 'Start Claude Code and run the printed prompt',
        body:
          'The CLI printed a one-liner. Pasting it scaffolds a Claude Code subagent, ingests every staged file, and creates initial knowledge pages.',
        code: '/hindsight-memory:create-agent marketing-seo from ~/.self-driving-agents/claude-code/marketing-seo',
      },
    ],
    howItWorks: [
      'The integration is the `hindsight-memory` plugin, installed from the `vectorize-io/hindsight` marketplace into Claude Code. It registers four hooks: `SessionStart` runs a health check; `UserPromptSubmit` does **pre-turn** recall and injects an invisible `<hindsight_memories>` block as `additionalContext`; `Stop` does **post-turn** retain (chunked, default every 10 turns with 2-turn overlap); `SessionEnd` cleans up. Connection lives in `~/.hindsight/claude-code.json` (external Hindsight, auto-managed local `hindsight-embed` daemon, or existing daemon). Tool and skill allowlist is in `~/.claude/settings.json` under `permissions.allow`. The plugin also exposes the tools below.',
    ],
    tools: [
      { name: 'list_pages', description: 'List page ids and names.' },
      { name: 'get_page', description: 'Read the content of a page.' },
      { name: 'create_page', description: 'Declare a new page recipe.' },
      { name: 'update_page', description: 'Change a page\'s name or source query.' },
      { name: 'delete_page', description: 'Remove a page.' },
      { name: 'recall', description: 'Search retained memories.' },
      { name: 'ingest', description: 'Add new text content as a memory.' },
      { name: 'ingest_file', description: 'Read a local file and ingest it.' },
      { name: 'get_current_bank', description: 'Get the active bank id.' },
    ],
    bankMapping: {
      summary:
        'Bank id is derived per `(agent, project)`. Same agent in two project directories means two different banks. Plugin config and connection live in `~/.hindsight/claude-code.json`.',
      details: [
        'The CLI sets `dynamicBankId: true` and `dynamicBankGranularity: ["agent", "project"]` in `~/.hindsight/claude-code.json`. The plugin combines the agent name and the project basename (cwd) into the bank id at runtime.',
        'It also sets `enableKnowledgeTools: true` so the MCP server exposes the `agent_knowledge_*` tools.',
        'Connection: `hindsightApiUrl` + `hindsightApiToken` in the same file (external Hindsight). Leave the URL empty to run a local `hindsight-embed` daemon — that mode needs an LLM key (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, etc.) for fact extraction.',
        'To re-map: change the agent name or the project directory (creates a new bank), or edit `~/.hindsight/claude-code.json` directly. The CLI bails if it sees `dynamicBankId: false` plus a static `bankId` — that conflicts with the per-`(agent, project)` isolation.',
      ],
    },
    links: [
      { label: 'Claude Code', href: 'https://docs.anthropic.com/en/docs/claude-code' },
      {
        label: 'hindsight-memory plugin',
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
      'Hermes profiles that learn from every conversation.',
    flag: '--harness hermes',
    whatYouGet: {
      intro:
        'Hermes runs each agent in its own profile — a clean slate every time. With self-driving agents installed, the profile builds up across sessions: the agent learns from every chat, maintains its own knowledge pages, and walks into the next session already informed.',
      items: [
        '**Learns from every conversation** — preferences, decisions, and recurring patterns are captured automatically. The agent walks into the next session already knowing them.',
        '**Builds its own playbooks** — the agent maintains long-form pages (a personal wiki) that self-rewrite from what it has learned.',
        '**One profile, one agent, one bank** — clean isolation. Multiple agents on one machine never share memory.',
      ],
    },
    steps: [
      {
        title: 'Have hermes on PATH',
        body:
          'The CLI shells out to `hermes profile create`, `profile show`, and reads the profile config. Install hermes-agent first if you haven\'t already.',
        code:
          'curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash',
      },
      {
        title: 'Install the agent',
        body:
          'One CLI call creates the Hermes profile, drops in the plugin, configures the connection, ingests seed content, and installs the agent-knowledge skill.',
        code: 'npx @vectorize-io/self-driving-agents install marketing/seo --harness hermes',
      },
      {
        title: 'Chat',
        body: 'Memory retains in the background as you talk.',
        code: 'hermes -p marketing-seo chat',
      },
    ],
    howItWorks: [
      'The CLI runs `hermes profile create <agent> --clone` (or reuses the existing profile), copies the `hindsight-sda` plugin into `<profile>/plugins/hindsight-sda/`, writes `<profile>/hindsight/config.json` (api url, token, bank id), and edits `<profile>/config.yaml` to set `memory.provider: hindsight` and add `hindsight-sda` to `plugins.enabled`. The bundled Hindsight memory provider then auto-retains during chat. The agent-knowledge skill is dropped into `<profile>/skills/agent-knowledge/SKILL.md` and exposes the tools below.',
    ],
    tools: [
      { name: 'list_pages', description: 'List page ids and names.' },
      { name: 'get_page', description: 'Read the content of a page.' },
      { name: 'create_page', description: 'Declare a new page recipe.' },
      { name: 'update_page', description: 'Change a page\'s name or source query.' },
      { name: 'delete_page', description: 'Remove a page.' },
      { name: 'recall', description: 'Search retained memories.' },
      { name: 'ingest', description: 'Add new text content as a memory.' },
    ],
    bankMapping: {
      summary:
        'Each Hermes profile maps 1:1 to one bank. Bank id equals the agent name (and the profile name). Connection lives in `<profile>/hindsight/config.json`.',
      details: [
        'The CLI writes `<profile>/hindsight/config.json` with `mode`, `api_url`, `api_key`, `bank_id`, `recall_budget`, and `memory_mode`. Both the bundled memory provider and the `hindsight-sda` tool plugin read this same file — single source of truth.',
        '`bank_id` is set to the agent name and `bank_id_template` is left empty, so every chat in the profile lands in the same bank.',
        'On install the CLI looks for an existing connection in this order: `<profile>/../hindsight/config.json`, then OpenClaw\'s plugin config, then prompts. Re-running install with the same agent name reuses the profile and updates the config in place.',
        'To re-map: edit `<profile>/hindsight/config.json` directly. No daemon restart needed — `hermes` reads it at the next chat.',
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
      'Claude.ai agents that learn from every conversation.',
    flag: '--harness claude',
    whatYouGet: {
      intro:
        'A claude.ai conversation today is a clean slate every time — nothing carries over. With self-driving agents installed, the agent gets sharper with use: it learns from each chat, builds its own knowledge pages, and walks into the next conversation already informed.',
      items: [
        '**Learns from every conversation** — preferences, decisions, and key information from each chat are saved and surface in the next one.',
        '**Builds its own playbooks** — the agent maintains long-form pages (a personal wiki) that self-rewrite from what it has learned.',
        '**Activate any agent on demand** — type `/<agent-name>` in any chat to load it. Multiple agents in the same Claude account stay isolated.',
      ],
    },
    steps: [
      {
        title: 'Install the agent',
        body:
          'One CLI call creates the bank in Hindsight, ingests seed content, and generates a self-contained skill zip with your connection baked in.',
        code: 'npx @vectorize-io/self-driving-agents install marketing/seo --harness claude',
      },
      {
        title: 'Upload the skill zip',
        body:
          'In claude.ai → Customize → Skills → Upload, select the zip the CLI just generated.',
      },
      {
        title: 'Allowlist the Hindsight host',
        body:
          'Settings → Capabilities → add the Hindsight host (e.g. `api.hindsight.vectorize.io`). The skill calls Hindsight via `curl`.',
      },
      {
        title: 'Activate in any chat',
        body: 'Start a new conversation and type the agent slash command.',
        code: '/marketing-seo',
      },
    ],
    howItWorks: [
      'Unlike the other harnesses, claude.ai has no plugin or hook surface — the integration is a Claude **Skill**: a zip with a `SKILL.md` whose Hindsight API URL, bank id, and token are baked in at install time. When you activate it, Claude reads the skill\'s startup sequence and loads every knowledge page in the bank. There are no auto-hooks, so the skill instructs the agent to **self-retain** important content during the conversation by `curl`-ing the retain endpoint. Self-hosted Hindsight must be publicly reachable from Claude\'s servers — localhost URLs are rejected at install time. The skill exposes the tools below.',
    ],
    tools: [
      { name: 'list_pages', description: 'List page ids and names.' },
      { name: 'get_page', description: 'Read a page.' },
      { name: 'create_page', description: 'Write a new page (title + content).' },
      { name: 'update_page', description: 'Overwrite a page (title + content).' },
      { name: 'delete_page', description: 'Remove a page.' },
      { name: 'recall', description: 'Search retained memories.' },
      { name: 'retain', description: 'Self-retain conversation content (no auto-hooks in claude.ai).' },
    ],
    bankMapping: {
      summary:
        'API URL, API token, and bank id are baked into the skill zip at install time. The CLI prompts for all three; the bank id defaults to the agent name. Re-binding means regenerating and re-uploading the zip.',
      details: [
        'During install you pick Cloud (`api.hindsight.vectorize.io`) or self-hosted, paste an API token, and choose a bank id — defaulted to the agent name.',
        'Those values are written into the skill\'s `SKILL.md` and called via `curl` from inside Claude at runtime. There is no in-Claude config to edit.',
        'To re-map: re-run `npx @vectorize-io/self-driving-agents install … --harness claude` with a new bank id, then re-upload the regenerated zip via Customize → Skills.',
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
      'OpenClaw agents that learn from every conversation.',
    flag: '--harness openclaw',
    whatYouGet: {
      intro:
        'OpenClaw out of the box runs your agent statically — every conversation starts fresh. Self-driving agents make the agent get better with use: it picks up your preferences, the patterns that work, the corrections you make, and walks into the next session already informed.',
      items: [
        '**Learns from every conversation** — preferences, decisions, and recurring patterns are captured automatically. The agent walks into the next session already knowing them.',
        '**Builds its own playbooks** — the agent maintains long-form pages (a personal wiki) that self-rewrite from what it has learned. Read them yourself, or let the agent read from them.',
        '**Each agent stays separate** — every agent in the gateway gets its own isolated learning, so multiple agents on one OpenClaw instance don\'t mix memories.',
      ],
    },
    steps: [
      {
        title: 'Have OpenClaw on PATH',
        body:
          'The CLI shells out to OpenClaw\'s own `plugins install` and `agents add` commands.',
      },
      {
        title: 'Install the agent',
        body:
          'One CLI call sets up the plugin, configures the connection, ingests seed content, and registers the agent.',
        code: 'npx @vectorize-io/self-driving-agents install marketing/seo --harness openclaw',
      },
      {
        title: 'Restart the gateway',
        body: 'OpenClaw caches plugin and agent state at startup.',
        code: 'openclaw gateway restart',
      },
      {
        title: 'Open a session',
        body: 'Memory works automatically from here on.',
        code: 'openclaw tui --session agent:marketing-seo:main:session1',
      },
    ],
    howItWorks: [
      'The integration is the `@vectorize-io/hindsight-openclaw` plugin (≥ 0.7.2), installed at `~/.openclaw/extensions/hindsight-openclaw/`. It registers two hooks: a **pre-turn** recall step pulls relevant memories and injects them as an invisible `<hindsight_memories>` system block, and a **post-turn** retain step saves the conversation. The plugin also exposes the tools below so the agent can manage its own pages.',
    ],
    tools: [
      { name: 'list_pages', description: 'List page ids and names.' },
      { name: 'get_page', description: 'Read the content of a page.' },
      { name: 'create_page', description: 'Declare a new page recipe.' },
      { name: 'update_page', description: 'Change a page\'s name or source query.' },
      { name: 'delete_page', description: 'Remove a page.' },
      { name: 'recall', description: 'Search retained memories.' },
      { name: 'ingest', description: 'Add new text content as a memory.' },
    ],
    bankMapping: {
      summary:
        'Each agent gets its own bank, named after the agent. The CLI sets `dynamicBankGranularity: ["agent"]` so SDA agents (which run without channel or sender context) don\'t end up with banks like `<agent>::unknown::anonymous`.',
      details: [
        'Connection lives in `~/.openclaw/openclaw.json` under `plugins.entries["hindsight-openclaw"].config` — external Hindsight (`hindsightApiUrl` + `hindsightApiToken`) or embedded daemon. Sensitive fields can be SecretRefs.',
        'Bank id derivation: `dynamicBankId: true` + `dynamicBankGranularity: ["agent"]` → bank id is the agent name (or `<bankIdPrefix>-<agent>` if you set a prefix).',
        'On a fresh install the CLI sets the granularity silently. On an existing config with a different granularity, it asks before overriding.',
        'To share one bank across all agents instead, set `dynamicBankId: false` and a fixed `bankId` — the CLI leaves that combination alone.',
        'Switch connection by re-running `npx --yes --package @vectorize-io/hindsight-openclaw hindsight-openclaw-setup`.',
      ],
    },
    links: [
      { label: 'OpenClaw', href: 'https://github.com/openclaw/openclaw' },
      {
        label: 'hindsight-openclaw plugin',
        href: 'https://www.npmjs.com/package/@vectorize-io/hindsight-openclaw',
      },
      {
        label: 'Hindsight integrations/openclaw',
        href: 'https://github.com/vectorize-io/hindsight/tree/main/integrations/openclaw',
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
      'NVIDIA NeMo Agent sandboxes that learn from every conversation.',
    flag: '--harness nemoclaw',
    whatYouGet: {
      intro:
        'NemoClaw runs an OpenClaw gateway inside an NVIDIA NeMo Agent sandbox. Without self-driving agents, every conversation in the sandbox starts fresh. With them installed, the agent learns from each chat — preferences, decisions, recurring patterns — and walks into the next session already informed.',
      items: [
        '**Learns from every conversation** — preferences, decisions, and recurring patterns are captured automatically. The agent walks into the next session already knowing them.',
        '**Builds its own playbooks** — the agent maintains long-form pages (a personal wiki) that self-rewrite from what it has learned.',
        '**Sandboxed by NeMo\'s policy engine** — the CLI patches just the network rules the plugin needs to reach Hindsight; everything else stays locked under Landlock.',
      ],
    },
    steps: [
      {
        title: 'Have NemoClaw on PATH',
        body:
          'The CLI shells out to `nemoclaw list`, `nemoclaw <sandbox> status`, and `nemoclaw <sandbox> skill install`. Create a sandbox first via `nemoclaw onboard` if you don\'t have one.',
      },
      {
        title: 'Install the agent',
        body:
          'One CLI call sets up the openclaw plugin on the host, patches the sandbox network policy, configures the connection (interactive on first run), ingests seed content, and installs the agent-knowledge skill into the sandbox.',
        code: 'npx @vectorize-io/self-driving-agents install marketing/seo --harness nemoclaw',
      },
      {
        title: 'Connect to the sandbox',
        body: 'Brings up the sandbox\'s gateway.',
        code: 'nemoclaw <sandbox> connect',
      },
      {
        title: 'Open a session',
        body: 'Memory works automatically from here on.',
        code: 'openclaw tui --session agent:main:main:session1',
      },
    ],
    howItWorks: [
      'NemoClaw runs OpenClaw inside an NVIDIA NeMo Agent sandbox with read-only config and Landlock filesystem isolation. The integration is the same `@vectorize-io/hindsight-openclaw` plugin (≥ 0.7.2) the OpenClaw harness uses, but configured through `hindsight-nemoclaw setup` so the sandbox\'s network policy gets patched in the right place. Two hooks fire on every turn: a **pre-turn** recall step injects an invisible `<hindsight_memories>` system block, and a **post-turn** retain step saves the conversation. The plugin also exposes the tools below.',
    ],
    tools: [
      { name: 'list_pages', description: 'List page ids and names.' },
      { name: 'get_page', description: 'Read the content of a page.' },
      { name: 'create_page', description: 'Declare a new page recipe.' },
      { name: 'update_page', description: 'Change a page\'s name or source query.' },
      { name: 'delete_page', description: 'Remove a page.' },
      { name: 'recall', description: 'Search retained memories.' },
      { name: 'ingest', description: 'Add new text content as a memory.' },
    ],
    bankMapping: {
      summary:
        'Each agent gets its own bank, prefixed with `nemoclaw-` by default. The CLI sets `dynamicBankGranularity: ["agent"]` so SDA agents in NeMo sandboxes don\'t end up with banks like `<agent>::unknown::anonymous`.',
      details: [
        'Connection lives in the host\'s `~/.openclaw/openclaw.json` under `plugins.entries["hindsight-openclaw"].config` — NemoClaw shares the host\'s plugin config. External Hindsight (`hindsightApiUrl` + `hindsightApiToken`) or embedded daemon. Sensitive fields can be SecretRefs.',
        'Bank id derivation: `dynamicBankId: true` + `dynamicBankGranularity: ["agent"]` + `bankIdPrefix: "nemoclaw"` → bank id is `nemoclaw-<agent>`.',
        'On a fresh install the CLI runs `hindsight-nemoclaw setup --sandbox <name>` interactively. On subsequent installs it re-runs the setup non-interactively so the sandbox\'s network policy stays in place.',
        'To share one bank across agents instead, set `dynamicBankId: false` and a fixed `bankId` in the host config — the CLI leaves that combination alone.',
        'To re-map: re-run `npx --yes --package @vectorize-io/hindsight-nemoclaw hindsight-nemoclaw setup --sandbox <name>`.',
      ],
    },
    links: [
      { label: 'NVIDIA NeMo Agent', href: 'https://github.com/NVIDIA/NeMo-Agent' },
      {
        label: 'hindsight-nemoclaw',
        href: 'https://www.npmjs.com/package/@vectorize-io/hindsight-nemoclaw',
      },
      {
        label: 'hindsight-openclaw plugin',
        href: 'https://www.npmjs.com/package/@vectorize-io/hindsight-openclaw',
      },
    ],
    color: '#76B900',
    logo: 'logos/nvidia.svg',
  },
];

export function findHarness(slug: string): Harness | undefined {
  return HARNESSES.find((h) => h.slug === slug);
}

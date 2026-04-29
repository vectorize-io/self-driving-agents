# Self-Driving Agents

Agents that learn from every conversation and get better over time.

No retraining, no manual updates — just use them and they improve. Powered by [Hindsight](https://github.com/vectorize-io/hindsight), so agent memory is portable across harnesses.

## Quick start

```bash
npx @vectorize-io/self-driving-agents install marketing/seo --harness openclaw
```

That's it. The CLI fetches the agent from this repo, sets up its memory bank, ingests the seed knowledge, and registers it with your harness. Follow the on-screen instructions to start chatting.

You can also point at a local directory or any GitHub repo:

```bash
npx @vectorize-io/self-driving-agents install ./my-agent --harness openclaw
npx @vectorize-io/self-driving-agents install my-org/my-repo/my-agent --harness openclaw
```

## How it works

1. You chat with the agent
2. Conversations are automatically retained into memory
3. The agent builds knowledge pages that update themselves after each conversation
4. Next session, the agent reads its updated pages — it remembers what works and what you prefer

You never tell it to "save" or "remember." It decides what matters and keeps itself current.

## Available agents

### [marketing/](marketing/)

Full marketing team — install the whole department or pick a specialty.

| Install | What you get |
|---------|-------------|
| `marketing` | Generalist — all 30 agent knowledge files across every specialty |
| `marketing/seo` | SEO specialist, search optimizer, citation strategist |
| `marketing/social-media` | Platform strategists for TikTok, Instagram, LinkedIn, X, Reddit |
| `marketing/content` | Content creator, growth hacker, book co-author |
| `marketing/ecommerce` | Cross-border commerce, livestream selling |
| `marketing/china-market` | WeChat, Douyin, Xiaohongshu, Baidu, Bilibili |

## Create your own

An agent is just a directory:

```
my-agent/
  bank-template.json     # optional — configures memory bank and knowledge pages
  seo-playbook.md        # any .md/.txt files become seed knowledge
  advanced-tips.md
```

Nest directories for multi-level agents:

```
my-team/
  bank-template.json     # install my-team → everything below
  specialist-a/
    bank-template.json   # install my-team/specialist-a → just this
    reference.md
  specialist-b/
    bank-template.json
    guide.md
```

Content files are discovered recursively. Each level can have its own `bank-template.json` with a tailored mission and knowledge pages.

## What `install` does

The CLI is a single setup command — no manual steps required. Here's what happens:

1. **Fetches the agent** — downloads the directory from GitHub (or uses a local path)
2. **Ensures the Hindsight plugin is installed** on your harness — installs it automatically if missing, and runs the configuration wizard if needed
3. **Connects to Hindsight** and imports the `bank-template.json` (memory bank config, knowledge pages, directives)
4. **Ingests all content files** (`.md`, `.txt`, etc.) found recursively as seed knowledge
5. **Creates a workspace** at `~/.self-driving-agents/<harness>/<agent>/` with the knowledge skill
6. **Registers the agent** with your harness and patches its startup to load the skill

After install, restart your harness gateway and start chatting.

## Supported harnesses

| Harness | Status |
|---------|--------|
| [OpenClaw](https://openclaw.dev) | Supported |
| [NemoClaw](https://github.com/NVIDIA/NeMo-Agent) | Coming soon |
| [Hermes](https://hermes-agent.nousresearch.com) | Coming soon |
| [Claude Code](https://claude.ai/code) | Coming soon |

## Requirements

- A supported harness
- Everything else is handled by the CLI — it installs the Hindsight plugin, runs the configuration wizard, and connects to the Hindsight API automatically

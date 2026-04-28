# Self-Driving Agents

Agents that learn from every conversation and get better over time. No retraining, no manual updates — just use them and they improve.

## Two pillars

### 1. Memory portability

Each agent is a directory you can share, version, and install anywhere. The directory contains everything the agent needs to start learning:

```
seo-blog-writer/
  bank-template.json   # knowledge pages + missions (optional)
  content/             # reference docs to seed the agent (optional)
```

One command installs it on any supported harness:

```bash
npx @vectorize-io/self-driving-agents install ./seo-blog-writer --harness openclaw
npx @vectorize-io/self-driving-agents install ./seo-blog-writer --harness hermes
npx @vectorize-io/self-driving-agents install ./seo-blog-writer --harness claude-code
```

The agent name defaults to the directory name. Override with `--agent my-name`.

### 2. Self-driving knowledge

Agents have **knowledge pages** that evolve automatically:

1. You chat with the agent
2. Conversations are retained into [Hindsight](https://github.com/vectorize-io/hindsight)
3. The system extracts observations in the background
4. Each knowledge page re-runs its source query against new observations
5. Next session, the agent reads updated pages and applies what it learned

The agent creates pages when it discovers something worth remembering. You never have to tell it to "save" or "remember" — it decides what matters and the system keeps it current.

**Example:** You tell the agent "keep posts to 800 words." It creates a preferences page. Next session, it writes 800-word posts without being asked. You share analytics showing comparison posts get 3x traffic. The performance page updates. Next session, it defaults to comparison format.

## Agents

### seo-blog-writer

SEO marketing agent that combines industry best practices with learned editorial preferences and real performance data.

```bash
npx @vectorize-io/self-driving-agents install ./marketing-seo-blog-posts --harness openclaw --agent seo-writer
```

**Knowledge pages (pre-configured):**
- **SEO Best Practices** — starts from a reference doc, adapts when your data contradicts generic advice
- **Content Performance** — accumulates analytics, identifies what formats and topics work
- **Editorial Preferences** — learns your tone, length, formatting rules from feedback

**Seed content:** `seo-specialist.md` — comprehensive SEO playbook, ingested at setup

## How to use

### OpenClaw

```bash
# 1. Setup
npx @vectorize-io/self-driving-agents install ./marketing-seo-blog-posts --harness openclaw --agent seo-writer

# 2. Create the agent in OpenClaw
openclaw agents add seo-writer --workspace ~/.hindsight-agents/openclaw/seo-writer --non-interactive

# 3. Restart gateway
openclaw gateway restart

# 4. Chat
openclaw tui --session agent:seo-writer:main:session1
```

The agent gets `agent_knowledge_*` tools automatically from the Hindsight plugin. No extra configuration needed.

### Requirements

- A supported harness (OpenClaw, Hermes, or Claude Code) with the Hindsight plugin installed
- Hindsight API running (embedded or external)

## Creating your own agent

```
my-agent/
  bank-template.json   # optional
  content/             # optional
```

`bank-template.json` pre-configures the agent's knowledge:

```json
{
  "version": "1",
  "bank": {
    "reflect_mission": "What this agent is about...",
    "retain_mission": "What to extract from conversations..."
  },
  "mental_models": [
    {
      "id": "user-preferences",
      "name": "User Preferences",
      "source_query": "What are the user's preferences?",
      "max_tokens": 4096,
      "trigger": {
        "refresh_after_consolidation": true,
        "mode": "delta",
        "exclude_mental_models": true,
        "fact_types": ["observation"]
      }
    }
  ]
}
```

Drop reference docs in `content/` — they're ingested at setup and become part of the agent's initial knowledge.

Then install:

```bash
npx @vectorize-io/self-driving-agents install ./my-agent --harness openclaw
```

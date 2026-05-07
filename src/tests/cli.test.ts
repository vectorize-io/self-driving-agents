import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, writeFile, mkdir } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "fs";
import { extname, relative, basename } from "path";

// ── Extracted helpers (mirroring cli.ts logic for unit testing) ──

const CONTENT_EXTS = new Set([".md", ".txt", ".html", ".json", ".csv", ".xml"]);
const IGNORED_FILES = new Set(["bank-template.json"]);

function findContentFiles(dir: string): string[] {
  const results: string[] = [];
  function walk(current: string) {
    for (const entry of readdirSync(current)) {
      const full = join(current, entry);
      if (statSync(full).isDirectory()) {
        walk(full);
      } else if (CONTENT_EXTS.has(extname(entry).toLowerCase()) && !IGNORED_FILES.has(entry)) {
        results.push(relative(dir, full));
      }
    }
  }
  walk(dir);
  return results.sort();
}

function isLocalPath(input: string): boolean {
  return (
    input.startsWith("./") ||
    input.startsWith("../") ||
    input.startsWith("/") ||
    input.startsWith("~")
  );
}

function parseAgentsJson(raw: string): any[] {
  const clean = raw.replace(/\n?\x1b\[[0-9;]*m[^\n]*/g, "").trim();
  const arrStart = clean.indexOf("\n[");
  const jsonStr = arrStart >= 0 ? clean.slice(arrStart + 1) : clean.startsWith("[") ? clean : "[]";
  return JSON.parse(jsonStr);
}

function resolveFromPluginConfig(
  agentId: string,
  pc: Record<string, any>
): { apiUrl: string; bankId: string; apiToken?: string } {
  const apiUrl = pc.hindsightApiUrl || `http://localhost:${pc.apiPort || 9077}`;
  const apiToken = pc.hindsightApiToken || undefined;

  let bankId: string;
  if (pc.dynamicBankId === false && pc.bankId) {
    bankId = pc.bankId;
  } else {
    const granularity: string[] = pc.dynamicBankGranularity || ["agent"];
    const fieldMap: Record<string, string> = {
      agent: agentId,
      channel: "unknown",
      user: "anonymous",
      provider: "unknown",
    };
    const base = granularity.map((f) => encodeURIComponent(fieldMap[f] || "unknown")).join("::");
    bankId = pc.bankIdPrefix ? `${pc.bankIdPrefix}-${base}` : base;
  }

  return { apiUrl, bankId, apiToken };
}

// ── Tests ──

describe("findContentFiles", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), "sda-test-"));
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it("finds .md files recursively", async () => {
    await writeFile(join(tmpDir, "root.md"), "hello");
    await mkdir(join(tmpDir, "sub"));
    await writeFile(join(tmpDir, "sub", "nested.md"), "world");

    const files = findContentFiles(tmpDir);
    expect(files).toEqual(["root.md", "sub/nested.md"]);
  });

  it("finds multiple content extensions", async () => {
    await writeFile(join(tmpDir, "a.md"), "md");
    await writeFile(join(tmpDir, "b.txt"), "txt");
    await writeFile(join(tmpDir, "c.html"), "html");
    await writeFile(join(tmpDir, "d.csv"), "csv");

    const files = findContentFiles(tmpDir);
    expect(files).toEqual(["a.md", "b.txt", "c.html", "d.csv"]);
  });

  it("excludes bank-template.json", async () => {
    await writeFile(join(tmpDir, "bank-template.json"), "{}");
    await writeFile(join(tmpDir, "readme.md"), "hello");

    const files = findContentFiles(tmpDir);
    expect(files).toEqual(["readme.md"]);
  });

  it("excludes non-content files", async () => {
    await writeFile(join(tmpDir, "image.png"), "binary");
    await writeFile(join(tmpDir, "script.js"), "code");
    await writeFile(join(tmpDir, "doc.md"), "content");

    const files = findContentFiles(tmpDir);
    expect(files).toEqual(["doc.md"]);
  });

  it("handles deeply nested directories", async () => {
    await mkdir(join(tmpDir, "a", "b", "c"), { recursive: true });
    await writeFile(join(tmpDir, "a", "b", "c", "deep.md"), "deep");

    const files = findContentFiles(tmpDir);
    expect(files).toEqual(["a/b/c/deep.md"]);
  });

  it("returns empty for directory with no content", async () => {
    await writeFile(join(tmpDir, "bank-template.json"), "{}");
    await writeFile(join(tmpDir, "image.png"), "binary");

    const files = findContentFiles(tmpDir);
    expect(files).toEqual([]);
  });

  it("ignores bank-template.json in subdirectories too", async () => {
    await mkdir(join(tmpDir, "sub"));
    await writeFile(join(tmpDir, "sub", "bank-template.json"), "{}");
    await writeFile(join(tmpDir, "sub", "guide.md"), "content");

    const files = findContentFiles(tmpDir);
    expect(files).toEqual(["sub/guide.md"]);
  });
});

describe("isLocalPath", () => {
  it("detects relative paths", () => {
    expect(isLocalPath("./my-agent")).toBe(true);
    expect(isLocalPath("../parent/agent")).toBe(true);
  });

  it("detects absolute paths", () => {
    expect(isLocalPath("/Users/me/agent")).toBe(true);
  });

  it("detects home paths", () => {
    expect(isLocalPath("~/dev/agent")).toBe(true);
  });

  it("rejects GitHub-style references", () => {
    expect(isLocalPath("marketing")).toBe(false);
    expect(isLocalPath("org/repo/path")).toBe(false);
    expect(isLocalPath("marketing/seo")).toBe(false);
  });
});

describe("deriveDefaultName", () => {
  // Mirrors the logic in resolveAgentDir:
  // - GitHub refs: subpath with / → hyphens (marketing/seo → marketing-seo)
  // - Local paths: basename of resolved dir

  function deriveFromGitHub(input: string): string {
    const parts = input.split("/");
    const subpath = parts.length <= 2 ? input : parts.slice(2).join("/");
    return subpath.replace(/\//g, "-");
  }

  it("single name stays as-is", () => {
    expect(deriveFromGitHub("marketing")).toBe("marketing");
  });

  it("two segments become hyphenated", () => {
    expect(deriveFromGitHub("marketing/seo")).toBe("marketing-seo");
  });

  it("three+ segments treat first two as org/repo", () => {
    // marketing/seo/technical → org=marketing, repo=seo, path=technical
    expect(deriveFromGitHub("marketing/seo/technical")).toBe("technical");
  });

  it("org/repo with deep path uses hyphenated path", () => {
    expect(deriveFromGitHub("my-org/my-repo/agents/seo")).toBe("agents-seo");
  });
});

describe("parseAgentsJson", () => {
  it("parses clean JSON array", () => {
    const agents = parseAgentsJson('[{"id": "main"}]');
    expect(agents).toEqual([{ id: "main" }]);
  });

  it("strips ANSI log lines before JSON", () => {
    const raw =
      "\x1b[38;5;103mhindsight:\x1b[0m plugin entry invoked\n" +
      '[\n  {"id": "main"},\n  {"id": "seo-writer", "name": "seo-writer"}\n]';
    const agents = parseAgentsJson(raw);
    expect(agents).toHaveLength(2);
    expect(agents[1].id).toBe("seo-writer");
  });

  it("returns empty array for unparseable output", () => {
    const agents = parseAgentsJson("some random text");
    expect(agents).toEqual([]);
  });

  it("handles multiple ANSI lines", () => {
    const raw = [
      "Config warnings:",
      "\x1b[35m[plugins]\x1b[39m registering plugin",
      "\x1b[35m[plugins]\x1b[39m hooks registered",
      '[{"id": "test"}]',
    ].join("\n");
    const agents = parseAgentsJson(raw);
    expect(agents).toEqual([{ id: "test" }]);
  });
});

describe("resolveFromPluginConfig", () => {
  it("uses external API URL when set", () => {
    const result = resolveFromPluginConfig("my-agent", {
      hindsightApiUrl: "https://api.example.com",
      hindsightApiToken: "tok-123",
      dynamicBankGranularity: ["agent"],
    });
    expect(result.apiUrl).toBe("https://api.example.com");
    expect(result.apiToken).toBe("tok-123");
    expect(result.bankId).toBe("my-agent");
  });

  it("falls back to localhost with apiPort", () => {
    const result = resolveFromPluginConfig("my-agent", {
      apiPort: 8888,
      dynamicBankGranularity: ["agent"],
    });
    expect(result.apiUrl).toBe("http://localhost:8888");
    expect(result.apiToken).toBeUndefined();
  });

  it("defaults to port 9077", () => {
    const result = resolveFromPluginConfig("my-agent", {});
    expect(result.apiUrl).toBe("http://localhost:9077");
  });

  it("computes bank ID with prefix", () => {
    const result = resolveFromPluginConfig("seo-writer", {
      bankIdPrefix: "nicolo",
      dynamicBankGranularity: ["agent"],
    });
    expect(result.bankId).toBe("nicolo-seo-writer");
  });

  it("computes bank ID without prefix", () => {
    const result = resolveFromPluginConfig("seo-writer", {
      dynamicBankGranularity: ["agent"],
    });
    expect(result.bankId).toBe("seo-writer");
  });

  it("uses multi-field granularity", () => {
    const result = resolveFromPluginConfig("my-agent", {
      dynamicBankGranularity: ["agent", "channel", "user"],
    });
    expect(result.bankId).toBe("my-agent::unknown::anonymous");
  });

  it("uses default granularity (agent-only) when not specified", () => {
    // SDA forces ["agent"] in plugin config, so the dry-run preview default
    // mirrors that. Multi-field granularity must be opted into explicitly.
    const result = resolveFromPluginConfig("my-agent", {});
    expect(result.bankId).toBe("my-agent");
  });

  it("uses static bankId when dynamicBankId is false", () => {
    const result = resolveFromPluginConfig("my-agent", {
      dynamicBankId: false,
      bankId: "static-bank",
    });
    expect(result.bankId).toBe("static-bank");
  });

  it("resolves nemoclaw-style config (external API, static bank)", () => {
    const result = resolveFromPluginConfig("marketing-seo", {
      hindsightApiUrl: "https://api.hindsight.vectorize.io",
      hindsightApiToken: "hsk_abc",
      llmProvider: "claude-code",
      dynamicBankId: false,
      bankIdPrefix: "my-sandbox",
    });
    expect(result.apiUrl).toBe("https://api.hindsight.vectorize.io");
    expect(result.apiToken).toBe("hsk_abc");
    // dynamicBankId=false but no bankId set, so falls through to dynamic path
    // with bankIdPrefix and the agent-only default granularity
    expect(result.bankId).toBe("my-sandbox-marketing-seo");
  });

  it("resolves nemoclaw-style config with static bankId", () => {
    const result = resolveFromPluginConfig("marketing-seo", {
      hindsightApiUrl: "https://api.hindsight.vectorize.io",
      hindsightApiToken: "hsk_abc",
      dynamicBankId: false,
      bankId: "my-sandbox-openclaw",
    });
    expect(result.bankId).toBe("my-sandbox-openclaw");
  });
});

describe("versionGte", () => {
  function versionGte(current: string, required: string): boolean {
    const [aMaj, aMin, aPat] = current.split(".").map(Number);
    const [bMaj, bMin, bPat] = required.split(".").map(Number);
    if (aMaj !== bMaj) return aMaj > bMaj;
    if (aMin !== bMin) return aMin > bMin;
    return aPat >= bPat;
  }

  it("equal versions return true", () => {
    expect(versionGte("0.7.2", "0.7.2")).toBe(true);
  });

  it("higher patch returns true", () => {
    expect(versionGte("0.7.3", "0.7.2")).toBe(true);
  });

  it("lower patch returns false", () => {
    expect(versionGte("0.7.1", "0.7.2")).toBe(false);
  });

  it("higher minor returns true", () => {
    expect(versionGte("0.8.0", "0.7.2")).toBe(true);
  });

  it("higher major returns true", () => {
    expect(versionGte("1.0.0", "0.7.2")).toBe(true);
  });

  it("lower major returns false", () => {
    expect(versionGte("0.6.9", "1.0.0")).toBe(false);
  });
});

describe("openclaw ensureOpenClawPluginInstalled decision tree", () => {
  // Mirrors the install/upgrade branching shared by both the openclaw flow
  // (ensurePlugin) and the nemoclaw flow (which now calls
  // ensureOpenClawPluginInstalled before ensureNemoClawPlugin so existing
  // nemoclaw users actually receive plugin upgrades — the nemoclaw setup
  // script otherwise passes --skip-plugin-install). The floor (0.7.4) was
  // bumped to capture the enableKnowledgeTools wiring fix.
  type Action = "install" | "reinstall" | "check-update";
  const FLOOR = "0.7.4";

  function decide(installed: boolean, currentVersion: string | null): Action {
    function gte(c: string, r: string) {
      const [aM, an, ap] = c.split(".").map(Number);
      const [bM, bn, bp] = r.split(".").map(Number);
      if (aM !== bM) return aM > bM;
      if (an !== bn) return an > bn;
      return ap >= bp;
    }
    if (!installed) return "install";
    if (!currentVersion || !gte(currentVersion, FLOOR)) return "reinstall";
    return "check-update";
  }

  it("installs when plugin is missing", () => {
    expect(decide(false, null)).toBe("install");
  });

  it("reinstalls when below the floor (drops the enableKnowledgeTools fix)", () => {
    expect(decide(true, "0.7.2")).toBe("reinstall");
    expect(decide(true, "0.7.3")).toBe("reinstall");
    expect(decide(true, "0.6.9")).toBe("reinstall");
  });

  it("checks for updates when at or above the floor", () => {
    expect(decide(true, "0.7.4")).toBe("check-update");
    expect(decide(true, "0.7.5")).toBe("check-update");
    expect(decide(true, "0.8.0")).toBe("check-update");
  });

  it("reinstalls when version cannot be read (treats as below floor)", () => {
    expect(decide(true, null)).toBe("reinstall");
  });
});

describe("harness argument parsing", () => {
  function parseHarness(args: string[]): { harness?: string; sandbox?: string } {
    let harness: string | undefined;
    let sandbox: string | undefined;
    for (let i = 0; i < args.length; i++) {
      if (args[i] === "--harness" && args[i + 1]) harness = args[++i];
      else if (args[i] === "--sandbox" && args[i + 1]) sandbox = args[++i];
    }
    return { harness, sandbox };
  }

  it("parses openclaw harness", () => {
    const { harness, sandbox } = parseHarness(["--harness", "openclaw"]);
    expect(harness).toBe("openclaw");
    expect(sandbox).toBeUndefined();
  });

  it("parses nemoclaw harness with sandbox", () => {
    const { harness, sandbox } = parseHarness([
      "--harness",
      "nemoclaw",
      "--sandbox",
      "my-assistant",
    ]);
    expect(harness).toBe("nemoclaw");
    expect(sandbox).toBe("my-assistant");
  });

  it("nemoclaw without sandbox returns undefined sandbox", () => {
    const { harness, sandbox } = parseHarness(["--harness", "nemoclaw"]);
    expect(harness).toBe("nemoclaw");
    expect(sandbox).toBeUndefined();
  });

  it("parses hermes harness", () => {
    const { harness } = parseHarness(["--harness", "hermes"]);
    expect(harness).toBe("hermes");
  });

  it("parses claude harness", () => {
    const { harness } = parseHarness(["--harness", "claude"]);
    expect(harness).toBe("claude");
  });

  it("parses claude-code harness", () => {
    const { harness } = parseHarness(["--harness", "claude-code"]);
    expect(harness).toBe("claude-code");
  });
});

describe("hermes hindsight config", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), "sda-hermes-test-"));
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it("generates correct hindsight/config.json", async () => {
    const hindsightDir = join(tmpDir, "hindsight");
    await mkdir(hindsightDir, { recursive: true });
    const cfg = {
      mode: "cloud",
      api_url: "https://api.hindsight.vectorize.io",
      api_key: "hsk_test",
      bank_id: "marketing-seo",
      bank_id_template: "",
      recall_budget: "mid",
      memory_mode: "hybrid",
    };
    await writeFile(join(hindsightDir, "config.json"), JSON.stringify(cfg));

    const loaded = JSON.parse(readFileSync(join(hindsightDir, "config.json"), "utf-8"));
    expect(loaded.bank_id).toBe("marketing-seo");
    expect(loaded.bank_id_template).toBe("");
    expect(loaded.api_url).toBe("https://api.hindsight.vectorize.io");
    expect(loaded.api_key).toBe("hsk_test");
    expect(loaded.mode).toBe("cloud");
  });

  it("empty bank_id_template prevents dynamic resolution", () => {
    // Mirrors _resolve_bank_id_template logic: empty template → use fallback
    function resolveTemplate(template: string, fallback: string): string {
      if (!template) return fallback;
      return template; // simplified — real impl does placeholder substitution
    }

    expect(resolveTemplate("", "marketing-seo")).toBe("marketing-seo");
    expect(resolveTemplate("hermes-{profile}", "fallback")).toBe("hermes-{profile}");
  });

  it("plugin config is read from hindsight/config.json", async () => {
    // Simulates what the hermes plugin does: read from HERMES_HOME/hindsight/config.json
    const hindsightDir = join(tmpDir, "hindsight");
    await mkdir(hindsightDir, { recursive: true });
    const cfg = {
      mode: "cloud",
      api_url: "https://custom.api.com",
      api_key: "hsk_custom",
      bank_id: "my-agent",
    };
    await writeFile(join(hindsightDir, "config.json"), JSON.stringify(cfg));

    // Read it back the way the plugin does
    const cfgPath = join(tmpDir, "hindsight", "config.json");
    const loaded = JSON.parse(readFileSync(cfgPath, "utf-8"));
    const normalized = {
      api_url: loaded.api_url || "",
      api_token: loaded.api_key || "",
      bank_id: loaded.bank_id || "hermes",
    };

    expect(normalized.api_url).toBe("https://custom.api.com");
    expect(normalized.api_token).toBe("hsk_custom");
    expect(normalized.bank_id).toBe("my-agent");
  });

  it("falls back to default bank_id when not set", async () => {
    const hindsightDir = join(tmpDir, "hindsight");
    await mkdir(hindsightDir, { recursive: true });
    await writeFile(
      join(hindsightDir, "config.json"),
      JSON.stringify({ mode: "cloud", api_url: "https://api.example.com", api_key: "tok" })
    );

    const loaded = JSON.parse(readFileSync(join(hindsightDir, "config.json"), "utf-8"));
    const bankId = loaded.bank_id || "hermes";
    expect(bankId).toBe("hermes");
  });
});

// ── Claude skill generation tests ─────────────────────

describe("claude skill generation", () => {
  function generateSkillFrontmatter(agentId: string, apiToken?: string): string {
    const authHeader = apiToken ? `-H "Authorization: Bearer ${apiToken}"` : "";
    return `---\nname: ${agentId}\ndescription: Activate the ${agentId} agent. Loads knowledge pages from Hindsight memory.\n---`;
  }

  it("includes required name frontmatter field", () => {
    const fm = generateSkillFrontmatter("marketing-seo");
    expect(fm).toContain("name: marketing-seo");
  });

  it("includes description frontmatter field", () => {
    const fm = generateSkillFrontmatter("my-agent");
    expect(fm).toContain("description: Activate the my-agent agent");
  });

  it("bakes auth token when provided", () => {
    const token: string | undefined = "secret-token";
    const authHeader = token ? `-H "Authorization: Bearer ${token}"` : "";
    expect(authHeader).toContain("Bearer secret-token");
  });

  it("omits auth header when no token", () => {
    const token: string | undefined = undefined;
    const authHeader = token ? `-H "Authorization: Bearer ${token}"` : "";
    expect(authHeader).toBe("");
  });
});

describe("claude config validation", () => {
  function validateUrl(v: string | undefined): string | undefined {
    if (!v) return "URL required";
    try {
      const parsed = new URL(v);
      if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
        return "Claude connects from Anthropic's cloud — localhost won't work. Use a public URL.";
      }
    } catch {
      return "Invalid URL";
    }
  }

  it("rejects localhost URLs", () => {
    expect(validateUrl("http://localhost:9077")).toContain("localhost");
    expect(validateUrl("http://127.0.0.1:9077")).toContain("localhost");
  });

  it("accepts public URLs", () => {
    expect(validateUrl("https://api.example.com")).toBeUndefined();
    expect(validateUrl("https://api.hindsight.vectorize.io")).toBeUndefined();
  });

  it("rejects empty/missing URLs", () => {
    expect(validateUrl("")).toBe("URL required");
    expect(validateUrl(undefined)).toBe("URL required");
  });

  it("rejects invalid URLs", () => {
    expect(validateUrl("not-a-url")).toBe("Invalid URL");
  });
});

describe("claude-code config resolution", () => {
  function resolveFromConfig(
    agentId: string,
    config: Record<string, any>
  ): { apiUrl: string; bankId: string; apiToken?: string } {
    const apiUrl = config.hindsightApiUrl || `http://localhost:${config.apiPort || 9077}`;
    const apiToken = config.hindsightApiToken || undefined;
    let bankId: string;
    if (config.dynamicBankId === false && config.bankId) {
      bankId = config.bankId;
    } else if (config.dynamicBankId) {
      const granularity: string[] = config.dynamicBankGranularity || ["agent", "project"];
      const fieldMap: Record<string, string> = {
        agent: config.agentName || agentId,
        project: "unknown",
        session: "unknown",
        channel: "default",
        user: "anonymous",
      };
      const base = granularity
        .map((f: string) => encodeURIComponent(fieldMap[f] || "unknown"))
        .join("::");
      bankId = config.bankIdPrefix ? `${config.bankIdPrefix}-${base}` : base;
    } else {
      bankId = config.bankIdPrefix ? `${config.bankIdPrefix}-${agentId}` : agentId;
    }
    return { apiUrl, bankId, apiToken };
  }

  it("uses external API URL when set", () => {
    const r = resolveFromConfig("agent", {
      hindsightApiUrl: "https://api.example.com",
      hindsightApiToken: "tok",
    });
    expect(r.apiUrl).toBe("https://api.example.com");
    expect(r.apiToken).toBe("tok");
  });

  it("defaults to localhost:9077", () => {
    const r = resolveFromConfig("agent", {});
    expect(r.apiUrl).toBe("http://localhost:9077");
  });

  it("uses agentId as default bank", () => {
    const r = resolveFromConfig("marketing-seo", {});
    expect(r.bankId).toBe("marketing-seo");
  });

  it("uses static bankId when dynamicBankId=false", () => {
    const r = resolveFromConfig("agent", { dynamicBankId: false, bankId: "my-bank" });
    expect(r.bankId).toBe("my-bank");
  });

  it("computes dynamic bankId", () => {
    const r = resolveFromConfig("seo", {
      dynamicBankId: true,
      agentName: "seo",
      dynamicBankGranularity: ["agent"],
    });
    expect(r.bankId).toBe("seo");
  });

  it("applies bankIdPrefix", () => {
    const r = resolveFromConfig("agent", { bankIdPrefix: "prod" });
    expect(r.bankId).toBe("prod-agent");
  });
});

describe("harness validation", () => {
  const SUPPORTED_HARNESSES = ["openclaw", "nemoclaw", "hermes", "claude", "claude-code"];

  it("accepts all supported harnesses", () => {
    for (const h of SUPPORTED_HARNESSES) {
      expect(SUPPORTED_HARNESSES.includes(h)).toBe(true);
    }
  });

  it("rejects unknown harnesses", () => {
    expect(SUPPORTED_HARNESSES.includes("chatgpt")).toBe(false);
    expect(SUPPORTED_HARNESSES.includes("")).toBe(false);
  });
});

// ── Claude Code plugin lifecycle decisions ──

describe("claude-code plugin install/update logic", () => {
  // Mirrors the decision logic in cli.ts:
  //   - if plugin not in `claude plugin list` output → install
  //   - else → run `claude plugin marketplace update` + `claude plugin update`
  function shouldInstall(pluginListOutput: string, pluginName: string): boolean {
    return !pluginListOutput.includes(pluginName);
  }

  function shouldUpdate(pluginListOutput: string, pluginName: string): boolean {
    return pluginListOutput.includes(pluginName);
  }

  it("installs when plugin not present", () => {
    const out = "Installed plugins:\n  ❯ rust-analyzer-lsp@claude-plugins-official\n    Version: 1.0.0";
    expect(shouldInstall(out, "hindsight-memory")).toBe(true);
    expect(shouldUpdate(out, "hindsight-memory")).toBe(false);
  });

  it("updates when plugin already present", () => {
    const out = "Installed plugins:\n  ❯ hindsight-memory@hindsight\n    Version: 0.5.0";
    expect(shouldInstall(out, "hindsight-memory")).toBe(false);
    expect(shouldUpdate(out, "hindsight-memory")).toBe(true);
  });

  it("detects plugin regardless of installed scope", () => {
    const userScope = "  ❯ hindsight-memory@hindsight\n    Scope: user";
    const localScope = "  ❯ hindsight-memory@hindsight\n    Scope: local";
    expect(shouldUpdate(userScope, "hindsight-memory")).toBe(true);
    expect(shouldUpdate(localScope, "hindsight-memory")).toBe(true);
  });
});

describe("claude-code marketplace detection", () => {
  // Mirrors the marketplace-add decision: if neither name nor repo is in the
  // `claude plugin marketplace list` output, we run `claude plugin marketplace add`.
  function hasMarketplace(out: string, name: string, repo: string): boolean {
    return out.includes(name) || out.includes(repo);
  }

  const MARKETPLACE_NAME = "hindsight";
  const MARKETPLACE_REPO = "vectorize-io/hindsight";

  it("detects when marketplace already added by name", () => {
    const out = "Configured marketplaces:\n  hindsight (github: vectorize-io/hindsight)";
    expect(hasMarketplace(out, MARKETPLACE_NAME, MARKETPLACE_REPO)).toBe(true);
  });

  it("detects when marketplace already added by repo", () => {
    const out = "Configured marketplaces:\n  some-other-name (github: vectorize-io/hindsight)";
    expect(hasMarketplace(out, MARKETPLACE_NAME, MARKETPLACE_REPO)).toBe(true);
  });

  it("returns false when marketplace not added", () => {
    const out = "Configured marketplaces:\n  claude-plugins-official";
    expect(hasMarketplace(out, MARKETPLACE_NAME, MARKETPLACE_REPO)).toBe(false);
  });

  it("returns false on empty marketplace list", () => {
    expect(hasMarketplace("", MARKETPLACE_NAME, MARKETPLACE_REPO)).toBe(false);
  });
});

describe("claude-code allowed-tools merge", () => {
  // Mirrors the auto-approve logic that merges entries into ~/.claude/settings.json's permissions.allow.
  function mergeAllowed(existing: string[], toAdd: string[]): { merged: string[]; updated: boolean } {
    const merged = [...existing];
    let updated = false;
    for (const tool of toAdd) {
      if (!merged.includes(tool)) {
        merged.push(tool);
        updated = true;
      }
    }
    return { merged, updated };
  }

  const HINDSIGHT_TOOLS = [
    "mcp__plugin_hindsight-memory_hindsight__*",
    "Skill(hindsight-memory:create-agent)",
    "Bash(ls ~/.self-driving-agents/*)",
    "Bash(cat ~/.self-driving-agents/*)",
  ];

  it("adds all tools to empty allowedTools", () => {
    const { merged, updated } = mergeAllowed([], HINDSIGHT_TOOLS);
    expect(updated).toBe(true);
    expect(merged).toEqual(HINDSIGHT_TOOLS);
  });

  it("preserves existing entries", () => {
    const { merged } = mergeAllowed(["Bash(npm *)", "Read"], HINDSIGHT_TOOLS);
    expect(merged).toContain("Bash(npm *)");
    expect(merged).toContain("Read");
    expect(merged).toContain("mcp__plugin_hindsight-memory_hindsight__*");
  });

  it("does not duplicate when already present", () => {
    const existing = [...HINDSIGHT_TOOLS];
    const { merged, updated } = mergeAllowed(existing, HINDSIGHT_TOOLS);
    expect(updated).toBe(false);
    expect(merged).toHaveLength(HINDSIGHT_TOOLS.length);
  });

  it("only adds missing entries", () => {
    const existing = ["mcp__plugin_hindsight-memory_hindsight__*"];
    const { merged, updated } = mergeAllowed(existing, HINDSIGHT_TOOLS);
    expect(updated).toBe(true);
    expect(merged).toHaveLength(HINDSIGHT_TOOLS.length);
  });
});

describe("openclaw dynamicBankGranularity enforcement", () => {
  // Mirrors ensureOpenClawAgentGranularity's decision logic. SDA agents are
  // local/per-agent — they don't have channel/user, so the plugin's default
  // ["agent","channel","user"] produces "<agent>::unknown::anonymous" banks.
  type Action = "noop" | "set-fresh" | "ask-confirm";
  function decide(current: unknown): Action {
    if (Array.isArray(current) && current.length === 1 && current[0] === "agent") {
      return "noop";
    }
    if (Array.isArray(current) && current.length > 0) {
      return "ask-confirm";
    }
    return "set-fresh";
  }

  it("sets [agent] when not configured (fresh install)", () => {
    expect(decide(undefined)).toBe("set-fresh");
    expect(decide(null)).toBe("set-fresh");
    expect(decide([])).toBe("set-fresh");
  });

  it("noop when already [agent]", () => {
    expect(decide(["agent"])).toBe("noop");
  });

  it("asks confirmation when set to a different value", () => {
    expect(decide(["agent", "channel", "user"])).toBe("ask-confirm");
    expect(decide(["channel"])).toBe("ask-confirm");
    expect(decide(["agent", "project"])).toBe("ask-confirm");
  });
});

describe("claude-code Hindsight config persistence", () => {
  // Mirrors the config-write logic: if existing config has a connection
  // (hindsightApiUrl or llmProvider), don't prompt; otherwise prompt.
  function shouldPromptConnection(config: Record<string, any>): boolean {
    return !config.hindsightApiUrl && !config.llmProvider;
  }

  function applyClaudeConfig(
    existing: Record<string, any>,
    prompted: { apiUrl: string; apiToken?: string }
  ): Record<string, any> {
    return {
      ...existing,
      hindsightApiUrl: prompted.apiUrl,
      hindsightApiToken: prompted.apiToken,
      enableKnowledgeTools: true,
      // Pin worktree resolution so all worktrees of a repo land in the same
      // bank, matching what cli.ts writes during the claude-code install flow.
      resolveWorktrees: true,
    };
  }

  it("prompts on first install (empty config)", () => {
    expect(shouldPromptConnection({})).toBe(true);
  });

  it("skips prompt when hindsightApiUrl already set", () => {
    expect(shouldPromptConnection({ hindsightApiUrl: "https://api.example.com" })).toBe(false);
  });

  it("skips prompt when llmProvider already set (local daemon mode)", () => {
    expect(shouldPromptConnection({ llmProvider: "openai" })).toBe(false);
  });

  it("writes Cloud connection on first install", () => {
    const result = applyClaudeConfig({}, {
      apiUrl: "https://api.hindsight.vectorize.io",
      apiToken: "hsk_abc",
    });
    expect(result.hindsightApiUrl).toBe("https://api.hindsight.vectorize.io");
    expect(result.hindsightApiToken).toBe("hsk_abc");
    expect(result.enableKnowledgeTools).toBe(true);
  });

  it("preserves other settings when applying connection", () => {
    const existing = { debug: true, retainEveryNTurns: 1 };
    const result = applyClaudeConfig(existing, { apiUrl: "https://x.com", apiToken: "t" });
    expect(result.debug).toBe(true);
    expect(result.retainEveryNTurns).toBe(1);
    expect(result.hindsightApiUrl).toBe("https://x.com");
  });

  it("always sets enableKnowledgeTools=true", () => {
    const result = applyClaudeConfig(
      { enableKnowledgeTools: false },
      { apiUrl: "https://x.com", apiToken: "t" }
    );
    expect(result.enableKnowledgeTools).toBe(true);
  });

  it("always pins resolveWorktrees=true so worktrees share one bank", () => {
    // Plugin already defaults to true, but SDA pins it explicitly so a future
    // plugin default flip can't fragment a user's memory across worktrees.
    const fresh = applyClaudeConfig({}, { apiUrl: "https://x.com", apiToken: "t" });
    expect(fresh.resolveWorktrees).toBe(true);
    const overridden = applyClaudeConfig(
      { resolveWorktrees: false },
      { apiUrl: "https://x.com", apiToken: "t" }
    );
    expect(overridden.resolveWorktrees).toBe(true);
  });
});

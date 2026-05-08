import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from "fs";
import { tmpdir } from "os";
import { join, resolve } from "path";
// @ts-expect-error - .mjs has no type declarations; runtime import is fine
import { findBankTemplates, lintBankTemplate, lintAll } from "../scripts/lint-bank-templates.mjs";

const REPO_ROOT = resolve(__dirname, "..", "..");

describe("lint-bank-templates", () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "sda-lint-"));
  });
  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("accepts a valid template (observations_mission + >=1 mental_models, no reflect_mission)", () => {
    const file = join(dir, "bank-template.json");
    writeFileSync(
      file,
      JSON.stringify({
        version: "1",
        bank: { observations_mission: "watch X" },
        mental_models: [{ id: "a", name: "A" }],
      }),
    );
    expect(lintBankTemplate(file)).toEqual([]);
  });

  it("rejects missing observations_mission", () => {
    const file = join(dir, "bank-template.json");
    writeFileSync(
      file,
      JSON.stringify({ bank: {}, mental_models: [{ id: "a", name: "A" }] }),
    );
    const errs = lintBankTemplate(file);
    expect(errs.some((e: string) => e.includes("observations_mission"))).toBe(true);
  });

  it("rejects empty observations_mission", () => {
    const file = join(dir, "bank-template.json");
    writeFileSync(
      file,
      JSON.stringify({
        bank: { observations_mission: "   " },
        mental_models: [{ id: "a", name: "A" }],
      }),
    );
    const errs = lintBankTemplate(file);
    expect(errs.some((e: string) => e.includes("observations_mission"))).toBe(true);
  });

  it("rejects empty mental_models", () => {
    const file = join(dir, "bank-template.json");
    writeFileSync(
      file,
      JSON.stringify({
        bank: { observations_mission: "watch X" },
        mental_models: [],
      }),
    );
    const errs = lintBankTemplate(file);
    expect(errs.some((e: string) => e.includes("mental_models"))).toBe(true);
  });

  it("rejects missing mental_models entirely", () => {
    const file = join(dir, "bank-template.json");
    writeFileSync(
      file,
      JSON.stringify({ bank: { observations_mission: "watch X" } }),
    );
    const errs = lintBankTemplate(file);
    expect(errs.some((e: string) => e.includes("mental_models"))).toBe(true);
  });

  it("rejects deprecated reflect_mission", () => {
    const file = join(dir, "bank-template.json");
    writeFileSync(
      file,
      JSON.stringify({
        bank: { observations_mission: "watch X", reflect_mission: "old" },
        mental_models: [{ id: "a", name: "A" }],
      }),
    );
    const errs = lintBankTemplate(file);
    expect(errs.some((e: string) => e.includes("reflect_mission"))).toBe(true);
  });

  it("rejects invalid JSON", () => {
    const file = join(dir, "bank-template.json");
    writeFileSync(file, "{ not json");
    const errs = lintBankTemplate(file);
    expect(errs.some((e: string) => e.toLowerCase().includes("json"))).toBe(true);
  });

  it("findBankTemplates walks recursively and skips node_modules", () => {
    mkdirSync(join(dir, "a", "b"), { recursive: true });
    mkdirSync(join(dir, "node_modules", "x"), { recursive: true });
    writeFileSync(join(dir, "bank-template.json"), "{}");
    writeFileSync(join(dir, "a", "bank-template.json"), "{}");
    writeFileSync(join(dir, "a", "b", "bank-template.json"), "{}");
    writeFileSync(join(dir, "node_modules", "x", "bank-template.json"), "{}");

    const found = findBankTemplates(dir);
    expect(found).toHaveLength(3);
    expect(found.every((f: string) => !f.includes("node_modules"))).toBe(true);
  });

  it("the actual repo passes lint", () => {
    const issues = lintAll(REPO_ROOT);
    expect(issues).toEqual([]);
  });
});

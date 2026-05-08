#!/usr/bin/env node
/**
 * Lint every bank-template.json in the repo.
 *
 * Rules:
 *   - bank.observations_mission must be a non-empty string
 *   - mental_models must be an array with at least one entry
 *   - bank.reflect_mission must NOT be present (deprecated)
 *
 * Run via `npm run lint`. Exits with code 1 on violations.
 *
 * Plain .mjs (no compile step) so it can run from source without tsx.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const SKIP_DIRS = new Set([
  "node_modules",
  "dist",
  ".git",
  ".github",
  ".next",
  "out",
]);

export function findBankTemplates(root) {
  const out = [];
  const walk = (dir) => {
    let entries;
    try {
      entries = readdirSync(dir);
    } catch {
      return;
    }
    for (const name of entries) {
      if (SKIP_DIRS.has(name) || name.startsWith(".")) continue;
      const full = join(dir, name);
      let st;
      try {
        st = statSync(full);
      } catch {
        continue;
      }
      if (st.isDirectory()) walk(full);
      else if (name === "bank-template.json") out.push(full);
    }
  };
  walk(root);
  return out.sort();
}

export function lintBankTemplate(file) {
  const errs = [];
  let raw;
  try {
    raw = readFileSync(file, "utf-8");
  } catch (e) {
    return [`cannot read: ${e.message}`];
  }
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    return [`invalid JSON: ${e.message}`];
  }
  const bank = data?.bank;
  if (!bank || typeof bank !== "object") {
    errs.push("missing `bank` object");
  } else {
    const obs = bank.observations_mission;
    if (typeof obs !== "string" || obs.trim().length === 0) {
      errs.push("`bank.observations_mission` must be a non-empty string");
    }
    if ("reflect_mission" in bank) {
      errs.push("`bank.reflect_mission` is deprecated and must be removed");
    }
  }
  const models = data?.mental_models;
  if (!Array.isArray(models) || models.length === 0) {
    errs.push("`mental_models` must be a non-empty array");
  }
  return errs;
}

export function lintAll(root) {
  const issues = [];
  for (const file of findBankTemplates(root)) {
    for (const message of lintBankTemplate(file)) {
      issues.push({ file: relative(root, file), message });
    }
  }
  return issues;
}

function main() {
  const root = process.argv[2] ?? process.cwd();
  const files = findBankTemplates(root);
  const issues = lintAll(root);
  if (issues.length === 0) {
    console.log(`✓ ${files.length} bank-template.json file(s) OK`);
    return;
  }
  for (const { file, message } of issues) {
    console.error(`✗ ${file}: ${message}`);
  }
  console.error(`\n${issues.length} issue(s) across ${files.length} file(s)`);
  process.exit(1);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}

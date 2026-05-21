#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const kitDir = path.resolve(__dirname, "..");
const specPath = path.join(kitDir, "spec.yaml");
const profilesDir = path.join(kitDir, "domain-profiles");
const profiles = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ["base", "node", "rust", "go", "tauri", "ai"];

function readProfile(name) {
  const file = path.join(profilesDir, `${name}.txt`);
  if (!fs.existsSync(file)) throw new Error(`Unknown domain profile: ${name}`);

  return fs.readFileSync(file, "utf8")
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && !line.startsWith("#"));
}

const domains = [...new Set(profiles.flatMap(readProfile))].sort();
const rendered = [
  "  allowedDomains:",
  "    # BEGIN GENERATED DOMAIN PROFILES",
  `    # Source: ${profiles.map(profile => `domain-profiles/${profile}.txt`).join(", ")}`,
  ...domains.map(domain => `    - "${domain}"`),
  "    # END GENERATED DOMAIN PROFILES"
].join("\n");

const spec = fs.readFileSync(specPath, "utf8");
const next = spec.replace(
  /  allowedDomains:\n[\s\S]*?\n\n  serviceDomains:/,
  `${rendered}\n\n  serviceDomains:`
);

if (next === spec) throw new Error("Could not find allowedDomains block in spec.yaml");
fs.writeFileSync(specPath, next);
console.log(`Rendered ${domains.length} allowed domain(s) from ${profiles.length} profile(s).`);

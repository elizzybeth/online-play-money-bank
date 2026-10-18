import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
const output = path.resolve(
  process.env.MONEY_TREE_PROFILE_DIR ?? "/private/tmp/money-tree-test-profiles",
);
mkdirSync(output, { recursive: true });
const started = performance.now();
const result = spawnSync(
  "/usr/bin/time",
  [
    process.platform === "darwin" ? "-l" : "-v",
    process.execPath,
    "--cpu-prof",
    "--heap-prof",
    `--heap-prof-dir=${output}`,
    `--cpu-prof-dir=${output}`,
    "--import",
    "tsx",
    "--test",
    "--test-isolation=none",
    "tests/*.test.ts",
  ],
  { encoding: "utf8", env: process.env },
);
writeFileSync(path.join(output, "unit.log"), result.stdout + result.stderr);
const report = {
  exit: result.status,
  wallMs: performance.now() - started,
  peakResidentMemory:
    (result.stderr.match(
      /^.*(?:maximum resident set size|Maximum resident set size).*$/im,
    ) ?? [])[0] ?? null,
  profileDirectory: output,
};
writeFileSync(
  path.join(output, "summary.json"),
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report));
process.exitCode = result.status ?? 1;

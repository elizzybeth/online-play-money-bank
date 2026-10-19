import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { prepareUnitBundles } from "./test-unit.mjs";
const output = path.resolve(
  process.env.MONEY_TREE_PROFILE_DIR ?? "/private/tmp/money-tree-test-profiles",
);
mkdirSync(output, { recursive: true });
const started = performance.now();
const bundles = await prepareUnitBundles();
const preparedMs = performance.now() - started;
const result = spawnSync(
  "/usr/bin/time",
  [
    process.platform === "darwin" ? "-l" : "-v",
    process.execPath,
    "--cpu-prof",
    "--heap-prof",
    `--heap-prof-dir=${output}`,
    `--cpu-prof-dir=${output}`,
    "--test",
    "--test-concurrency=3",
    ...bundles,
  ],
  { encoding: "utf8", env: process.env, timeout: 60000, killSignal: "SIGKILL" },
);
writeFileSync(path.join(output, "unit.log"), result.stdout + result.stderr);
const report = {
  exit: result.status,
  preparedMs,
  workers: bundles.length,
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

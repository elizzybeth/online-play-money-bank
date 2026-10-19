import { createHash } from "node:crypto";
import {
  readdir,
  readFile,
  writeFile,
  mkdir,
  access,
  rm,
} from "node:fs/promises";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";
import { availableParallelism } from "node:os";

// Compile once, then run the actual Node tests without per-module TS loaders.
// Content hashes cover every input, so an edit never reuses stale test code.
export async function prepareUnitBundles(root = process.cwd()) {
  const files = [];
  async function collect(dir, filter) {
    for (const entry of (await readdir(dir, { withFileTypes: true })).sort(
      (a, b) => a.name.localeCompare(b.name),
    )) {
      const file = join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== "browser")
        await collect(file, filter);
      else if (filter(file)) files.push(file);
    }
  }
  await collect(join(root, "src"), (f) => f.endsWith(".ts"));
  const tests = (await readdir(join(root, "tests")))
    .filter((f) => f.endsWith(".test.ts"))
    .sort();
  if (!tests.length) throw Error("No unit tests found");
  const workers = Math.min(3, availableParallelism(), tests.length);
  await collect(join(root, "tests"), (f) => f.endsWith(".ts"));
  await collect(join(root, "tools"), (f) => /\.(mjs|ts)$/.test(f));
  files.push(join(root, "package.json"), join(root, "pnpm-lock.yaml"));
  const hash = createHash("sha256")
    .update(process.version)
    .update(root)
    .update(String(workers));
  for (const file of files) hash.update(file).update(await readFile(file));
  const cache = join(root, "node_modules", ".cache", "money-tree-tests");
  const key = hash.digest("hex").slice(0, 20);
  const outputs = Array.from({ length: workers }, (_, i) =>
    join(cache, `unit-${key}-${i}.test.mjs`),
  );
  const ready = join(cache, `unit-${key}.ready`);
  try {
    await access(ready);
    await Promise.all(outputs.flatMap((f) => [access(f), access(f + ".map")]));
    return outputs;
  } catch {}
  await mkdir(cache, { recursive: true });
  // tsx already supplies esbuild as its TypeScript compiler.
  const { build } = createRequire(import.meta.resolve("tsx"))("esbuild");
  await Promise.all(
    outputs.map((output, shard) =>
      build({
        stdin: {
          contents: tests
            .filter((_, i) => i % workers === shard)
            .map((f) => `import ${JSON.stringify(join(root, "tests", f))};`)
            .join("\n"),
          resolveDir: root,
          sourcefile: `unit-entry-${shard}.ts`,
        },
        outfile: output,
        bundle: true,
        packages: "external",
        format: "esm",
        platform: "node",
        target: "node22",
        sourcemap: "linked",
        minifySyntax: true,
      }),
    ),
  );
  await writeFile(ready, key);
  for (const file of await readdir(cache))
    if (
      /^unit-[a-f0-9]+(?:-[0-9]+\.test)?\.mjs(?:\.map)?$/.test(file) &&
      !file.startsWith(`unit-${key}-`)
    )
      await rm(join(cache, file));
  for (const file of await readdir(cache))
    if (/^unit-[a-f0-9]+\.ready$/.test(file) && file !== `unit-${key}.ready`)
      await rm(join(cache, file));
  return outputs;
}
if (
  process.argv[1] &&
  pathToFileURL(resolve(process.argv[1])).href === import.meta.url
) {
  const outputs = await prepareUnitBundles();
  const result = spawnSync(
    process.execPath,
    ["--enable-source-maps", "--test", "--test-concurrency=3", ...outputs],
    {
      stdio: "inherit",
      env: {
        ...process.env,
        ...(process.argv.includes("--stress")
          ? { MONEY_TREE_STRESS: "1" }
          : {}),
      },
    },
  );
  process.exitCode = result.status ?? 1;
}

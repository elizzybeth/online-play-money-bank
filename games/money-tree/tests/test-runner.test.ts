import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, stat, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

test("compiled unit cache reuses unchanged files and invalidates source and imported helpers", async () => {
  const { prepareUnitBundles } = await import(
    pathToFileURL(resolve("tools/test-unit.mjs")).href
  );
  const root = await mkdtemp(join(tmpdir(), "money-tree-unit-cache-"));
  try {
    for (const dir of ["src", "tests/helpers", "tools"])
      await mkdir(join(root, dir), { recursive: true });
    await writeFile(join(root, "package.json"), '{"type":"module"}');
    await writeFile(join(root, "pnpm-lock.yaml"), "fixture");
    await writeFile(join(root, "src/value.ts"), "export const value = 1;");
    await writeFile(
      join(root, "tests/helpers/value.ts"),
      "export const extra = 2;",
    );
    await writeFile(
      join(root, "tests/value.test.ts"),
      'import {value} from "../src/value"; import {extra} from "./helpers/value"; if(value + extra !== 3) throw Error("wrong fixture");',
    );
    const first: string[] = await prepareUnitBundles(root);
    assert.equal(first.length, 1);
    const before = (await stat(first[0])).mtimeMs;
    assert.deepEqual(await prepareUnitBundles(root), first);
    assert.equal((await stat(first[0])).mtimeMs, before);
    await writeFile(join(root, "src/value.ts"), "export const value = 2;");
    const edited = await prepareUnitBundles(root);
    assert.notDeepEqual(edited, first);
    await writeFile(
      join(root, "tests/helpers/value.ts"),
      "export const extra = 3;",
    );
    assert.notDeepEqual(await prepareUnitBundles(root), edited);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
test("compiled fixture server serves Pages paths, validates cached assets and rejects traversal", async () => {
  const root = await mkdtemp(join(tmpdir(), "money-tree-server-"));
  await writeFile(join(root, "index.html"), "<h1>Compiled fixture</h1>");
  await writeFile(join(root, "app.js"), "window.fixture=true;");
  const child = spawn(process.execPath, ["tools/serve-game.mjs"], {
    env: { ...process.env, MONEY_TREE_BUILD_DIR: root, MONEY_TREE_PORT: "0" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  try {
    const port = await new Promise<string>((resolve, reject) => {
      child.stdout.on("data", (data) => {
        const m = String(data).match(/port=(\d+)/);
        if (m) resolve(m[1]);
      });
      child.once("error", reject);
      child.once("exit", (code) => reject(Error("server exited " + code)));
    });
    const base = `http://127.0.0.1:${port}/money-tree/`;
    const html = await fetch(base + "?test");
    assert.equal(await html.text(), "<h1>Compiled fixture</h1>");
    const js = await fetch(base + "app.js");
    assert.equal(
      js.headers.get("content-type"),
      "text/javascript; charset=utf-8",
    );
    assert.equal(await js.text(), "window.fixture=true;");
    const cached = await fetch(base + "app.js", {
      headers: { "if-none-match": js.headers.get("etag")! },
    });
    assert.equal(cached.status, 304);
    assert.equal(await cached.text(), "");
    const outside = await fetch(base + "%2e%2e%2f%2e%2e%2fprivate.txt");
    assert.equal(outside.status, 403);
    assert.equal((await fetch(base + "missing.js")).status, 404);
  } finally {
    child.kill();
    await new Promise((r) => child.once("exit", r));
    await rm(root, { recursive: true, force: true });
  }
});

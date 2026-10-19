import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
function launch(root: string, port = "0") {
  const child = spawn(process.execPath, ["tools/serve-game.mjs"], {
    env: { ...process.env, MONEY_TREE_BUILD_DIR: root, MONEY_TREE_PORT: port },
    stdio: ["ignore", "pipe", "pipe"],
  });
  // Install this before startup can fail: cleanup must also handle an already-exited child.
  const exited = new Promise<void>((resolve) =>
    child.once("exit", () => resolve()),
  );
  const ready = new Promise<string>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(Error("fixture server startup exceeded 5 seconds")),
      5000,
    );
    let output = "";
    child.stdout.on("data", (data) => {
      output += String(data);
      const m = output.match(/port=(\d+)/);
      if (m) {
        clearTimeout(timer);
        resolve(m[1]);
      }
    });
    child.once("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.once("exit", (code) => {
      clearTimeout(timer);
      reject(Error("server exited " + code));
    });
  });
  return { child, exited, ready };
}
test("compiled fixture server serves Pages paths, validates cached assets and rejects traversal", async () => {
  const root = await mkdtemp(join(tmpdir(), "money-tree-server-"));
  await writeFile(join(root, "index.html"), "<h1>Compiled fixture</h1>");
  await writeFile(join(root, "app.js"), "window.fixture=true;");
  const { child, exited, ready } = launch(root);
  try {
    const port = await ready;
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
    await exited;
    await rm(root, { recursive: true, force: true });
  }
});

test(
  "fixture startup failure rejects promptly and cleanup cannot miss the child exit",
  { timeout: 10000 },
  async () => {
    const { child, exited, ready } = launch(tmpdir(), "-1");
    try {
      await assert.rejects(ready, /server exited/);
    } finally {
      child.kill();
      await exited;
    }
  },
);

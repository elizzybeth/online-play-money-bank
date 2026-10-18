// Serve the exact compiled artifact used by Pages, without Vite transforms/HMR.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, sep, extname } from "node:path";
const root = resolve(process.env.MONEY_TREE_BUILD_DIR ?? "dist");
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".ttf": "font/ttf",
  ".woff2": "font/woff2",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".json": "application/json",
};
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    const relative = decodeURIComponent(url.pathname).replace(
      /^\/money-tree(?:\/|$)/,
      "/",
    );
    const file = resolve(
      root,
      "." + (relative.endsWith("/") ? relative + "index.html" : relative),
    );
    if (!file.startsWith(root + sep)) {
      res.writeHead(403).end();
      return;
    }
    const info = await stat(file);
    if (!info.isFile()) throw Error("not a file");
    const etag = '"' + info.size + "-" + info.mtimeMs + '"';
    res.setHeader("ETag", etag);
    res.setHeader("Cache-Control", "no-cache");
    if (req.headers["if-none-match"] === etag) {
      res.writeHead(304).end();
      return;
    }
    const body = await readFile(file);
    res.setHeader(
      "Content-Type",
      mime[extname(file)] ?? "application/octet-stream",
    );
    res.setHeader("Content-Length", body.length);
    res.writeHead(200).end(req.method === "HEAD" ? undefined : body);
  } catch {
    res.writeHead(404).end("Not found");
  }
});
server.listen(Number(process.env.MONEY_TREE_PORT ?? 5173), "127.0.0.1", () =>
  console.log(`Compiled game: ${root} port=${server.address().port}`),
);

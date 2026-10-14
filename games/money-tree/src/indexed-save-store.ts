import { decode, fresh, type State } from "./game";
const KEY = "money-tree-v1";
type Packed =
  { format: "gzip"; bytes: Uint8Array } | { format: "text"; text: string };
async function pack(text: string): Promise<Packed> {
  if (typeof CompressionStream === "undefined") return { format: "text", text };
  const stream = new Blob([text])
    .stream()
    .pipeThrough(new CompressionStream("gzip"));
  return {
    format: "gzip",
    bytes: new Uint8Array(await new Response(stream).arrayBuffer()),
  };
}
async function unpack(value: Packed | undefined): Promise<string | null> {
  if (!value) return null;
  if (value.format === "text") return value.text;
  const stream = new Blob([value.bytes as BlobPart])
    .stream()
    .pipeThrough(new DecompressionStream("gzip"));
  return new Response(stream).text();
}
function request<T>(r: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}
function committed(tx: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onabort = tx.onerror = () =>
      reject(tx.error ?? Error("Save transaction aborted"));
  });
}
export class IndexedSaveStore {
  protected = false;
  recovered = false;
  rejected: string | null = null;
  private previous: string | null = null;
  private previousValid = false;
  private epoch = 0;
  private emergencyPending: Promise<boolean> = Promise.resolve(true);
  private worker = new Worker(new URL("./save-worker.ts", import.meta.url), {
    type: "module",
  });
  private nextId = 0;
  private workerFailed = false;
  private requests = new Map<
    number,
    {
      resolve: (r: { valid: boolean; raw: string; packed: Packed }) => void;
      reject: (error: unknown) => void;
    }
  >();
  private checkpointDay = -1;
  private queue: Promise<unknown> = Promise.resolve();
  private constructor(private db: IDBDatabase) {
    this.worker.onmessage = (event) => {
      const r = this.requests.get(event.data.id);
      if (!r) return;
      this.requests.delete(event.data.id);
      if (event.data.error) r.reject(Error(event.data.error));
      else r.resolve(event.data);
    };
    this.worker.onerror = () => {
      this.workerFailed = true;
      this.requests.forEach((r) => r.reject(Error("Save worker unavailable")));
      this.requests.clear();
    };
  }
  private encode(state: State) {
    if (this.workerFailed)
      return Promise.reject(Error("Save worker unavailable"));
    const id = ++this.nextId;
    return new Promise<{ valid: boolean; raw: string; packed: Packed }>(
      (resolve, reject) => {
        this.requests.set(id, { resolve, reject });
        try {
          this.worker.postMessage({ id, state });
        } catch (error) {
          this.requests.delete(id);
          reject(error);
        }
      },
    );
  }
  static async open() {
    const r = indexedDB.open("money-tree", 1);
    r.onupgradeneeded = () => r.result.createObjectStore("saves");
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(Error("IndexedDB could not open")),
        10000,
      );
      r.onsuccess = () => {
        clearTimeout(timeout);
        resolve(r.result);
      };
      r.onerror = () => {
        clearTimeout(timeout);
        reject(r.error);
      };
      r.onblocked = () => {
        clearTimeout(timeout);
        reject(Error("Close another game tab to upgrade storage"));
      };
    });
    db.onversionchange = () => db.close();
    return new IndexedSaveStore(db);
  }
  private async get(key: string) {
    return request<Packed | undefined>(
      this.db.transaction("saves").objectStore("saves").get(key),
    );
  }
  private async put(values: [string, string][]) {
    // Compress before opening the transaction: transactions cannot remain active across awaits.
    const packed = await Promise.all(
      values.map(async ([key, raw]) => [key, await pack(raw)] as const),
    );
    const tx = this.db.transaction("saves", "readwrite", {
        durability: "strict",
      }),
      done = committed(tx);
    try {
      for (const [key, value] of packed)
        tx.objectStore("saves").put(value, key);
    } catch (error) {
      tx.abort();
      await done.catch(() => {});
      throw error;
    }
    await done;
  }
  async read() {
    let raw = await unpack(await this.get(KEY));
    if (raw === null) {
      // Local storage is read only during migration. Remove it only after the atomic
      // IndexedDB commit and read-back verification, including unreadable originals.
      const legacy = localStorage.getItem(KEY);
      if (legacy !== null) {
        const values: [string, string][] = [[KEY, legacy]];
        for (const suffix of ["-backups", "-rejected", "-debug-backup"]) {
          const value = localStorage.getItem(KEY + suffix);
          if (value !== null) values.push([KEY + suffix, value]);
        }
        await this.put(values);
        raw = await unpack(await this.get(KEY));
        if (raw !== legacy) throw Error("Migration verification failed");
        for (const [key] of values) {
          try {
            localStorage.removeItem(key);
          } catch {}
        }
      }
    }
    this.rejected = await unpack(await this.get(KEY + "-rejected"));
    const state = decode(raw);
    if (state || !raw) {
      this.previous = raw;
      this.previousValid = !!state;
      return state ?? fresh();
    }
    this.rejected = raw;
    await this.put([[KEY + "-rejected", raw]]);
    for (const backup of (await this.backups()).reverse()) {
      const restored = decode(backup);
      if (restored) {
        this.recovered = true;
        this.previous = raw;
        return restored;
      }
    }
    this.protected = true;
    return fresh();
  }
  private async backups(): Promise<string[]> {
    const raw = await unpack(await this.get(KEY + "-backups"));
    try {
      const value = JSON.parse(raw ?? "[]");
      return Array.isArray(value)
        ? value.filter((v) => typeof v === "string").slice(-3)
        : [];
    } catch {
      return [];
    }
  }
  write(state: State, replace = false): Promise<boolean> {
    // postMessage snapshots at the call boundary; encoding/validation/compression
    // happen off the rendering thread. Commit intents in their original order.
    const day = state.day,
      epoch = this.epoch,
      encoded = this.encode(state);
    void encoded.catch(() => {});
    const task = this.queue.then(async () => {
      if (this.protected && !replace) return false;
      const result = await encoded;
      if (epoch !== this.epoch) return this.emergencyPending;
      if (!result.valid) return false;
      const { raw, packed } = result;
      if (raw === this.previous) return true;
      const values: [string, Packed][] = [[KEY, packed]];
      if (this.previous && this.previousValid && this.checkpointDay !== day) {
        const backups = (await this.backups()).filter(
          (b) => b !== this.previous,
        );
        backups.push(this.previous);
        values.push([
          KEY + "-backups",
          await pack(JSON.stringify(backups.slice(-3))),
        ]);
      }
      if (epoch !== this.epoch) return this.emergencyPending;
      const tx = this.db.transaction("saves", "readwrite", {
          durability: "strict",
        }),
        done = committed(tx);
      try {
        for (const [key, value] of values)
          tx.objectStore("saves").put(value, key);
      } catch (error) {
        tx.abort();
        await done.catch(() => {});
        throw error;
      }
      await done;
      this.checkpointDay = day;
      this.previous = raw;
      this.previousValid = true;
      this.protected = false;
      return true;
    });
    this.queue = task.catch(() => {});
    return task;
  }
  emergency(state: State): Promise<boolean> {
    // Start a native transaction synchronously on page hide/refresh rather than
    // waiting for a worker that the browser may terminate. Normal saves compress it.
    if (this.protected) return Promise.resolve(false);
    try {
      const raw = JSON.stringify(state);
      if (!decode(raw)) return Promise.resolve(false);
      ++this.epoch;
      const tx = this.db.transaction("saves", "readwrite", {
          durability: "strict",
        }),
        done = committed(tx);
      try {
        tx.objectStore("saves").put({ format: "text", text: raw }, KEY);
        tx.commit();
      } catch {
        try {
          tx.abort();
        } catch {}
        void done.catch(() => {});
        return Promise.resolve(false);
      }
      this.emergencyPending = done
        .then(() => {
          this.previous = raw;
          this.previousValid = true;
          return true;
        })
        .catch(() => false);
      return this.emergencyPending;
    } catch {
      return Promise.resolve(false);
    }
  }
  async debugBackup(state: State) {
    await this.queue;
    if (!(await this.get(KEY + "-debug-backup")))
      await this.put([[KEY + "-debug-backup", JSON.stringify(state)]]);
  }
  async readDebugBackup() {
    await this.queue;
    return unpack(await this.get(KEY + "-debug-backup"));
  }
  async readRaw(key = KEY) {
    await this.queue;
    return unpack(await this.get(key));
  }
  async flush() {
    await this.queue;
    await this.emergencyPending;
  }
}

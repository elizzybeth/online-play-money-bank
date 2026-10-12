import { decode, fresh, type State } from "./game";
export class SaveStore {
  readonly key = "money-tree-v1";
  protected = false;
  recovered = false;
  rejected: string | null = null;
  private checkpointed = false;
  private checkpointDay = 0;
  constructor(private storage: Pick<Storage, "getItem" | "setItem">) {}
  read() {
    this.protected = true;
    const raw = this.storage.getItem(this.key),
      state = decode(raw);
    if (state || !raw) {
      this.protected = false;
      return state ?? fresh();
    }
    this.rejected = raw;
    // Never destroy data merely because a newer validator cannot understand it.
    try {
      this.storage.setItem(this.key + "-rejected", raw);
    } catch {}
    for (const backup of this.backups().reverse()) {
      const restored = decode(backup);
      if (restored) {
        this.protected = false;
        this.recovered = true;
        return restored;
      }
    }
    this.protected = true;
    return fresh();
  }
  private backups(): string[] {
    try {
      const value = JSON.parse(
        this.storage.getItem(this.key + "-backups") ?? "[]",
      );
      return Array.isArray(value)
        ? value.filter((v) => typeof v === "string")
        : [];
    } catch {
      return [];
    }
  }
  write(state: State, replace = false) {
    if (this.protected && !replace) return false;
    const raw = JSON.stringify(state);
    if (!decode(raw)) return false;
    const previous = this.storage.getItem(this.key);
    if (
      previous &&
      decode(previous) &&
      (!this.checkpointed || this.checkpointDay !== state.day)
    ) {
      const backups = this.backups().filter((b) => b !== previous);
      backups.push(previous);
      // Backup failure must not make an otherwise valid save impossible.
      try {
        this.storage.setItem(
          this.key + "-backups",
          JSON.stringify(backups.slice(-3)),
        );
      } catch {}
      this.checkpointed = true;
      this.checkpointDay = state.day;
    }
    this.storage.setItem(this.key, raw);
    this.protected = false;
    return true;
  }
}

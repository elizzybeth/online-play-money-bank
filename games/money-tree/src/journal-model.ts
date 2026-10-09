import {
  CreateWebWorkerMLCEngine,
  type WebWorkerMLCEngine,
} from "@mlc-ai/web-llm";
import {
  generateJournal,
  type JournalContext,
  type JournalCompletion,
} from "./journal";
let engine: Promise<WebWorkerMLCEngine> | undefined;
let worker: Worker | undefined;
let generation = 0;
const waiters = new Set<{
  timer: ReturnType<typeof setTimeout>;
  reject: (reason: Error) => void;
}>();
export function stopJournalModel(
  reason = "The journal writer stopped. Your entry is saved; you can retry.",
) {
  generation++;
  worker?.terminate();
  worker = undefined;
  engine = undefined;
  for (const waiter of waiters) {
    clearTimeout(waiter.timer);
    waiter.reject(new Error(reason));
  }
  waiters.clear();
}
export async function writeLocalJournal(
  context: JournalContext,
  progress: (text: string) => void,
): Promise<string> {
  const run = generation;
  const current = () => {
    if (run !== generation)
      throw new Error("The journal writer stopped. Your entry is saved.");
  };
  const gpu = (
    navigator as Navigator & {
      gpu?: { requestAdapter: () => Promise<unknown> };
    }
  ).gpu;
  if (!gpu || !(await gpu.requestAdapter()))
    throw new Error(
      "This browser cannot run the local journal writer. Your entry is saved; you can try again in a browser with WebGPU.",
    );
  current();
  if (!engine) {
    progress(
      "Getting the local journal writer ready. The first download is about 5.2 GB; later visits use the saved model.",
    );
    worker = new Worker(new URL("./journal-worker.ts", import.meta.url), {
      type: "module",
    });
    engine = CreateWebWorkerMLCEngine(
      worker,
      "gemma-2-9b-it-q4f32_1-MLC",
      {
        initProgressCallback: (info) =>
          progress(
            `Getting the journal writer ready: ${Math.round(info.progress * 100)}%. The first download is about 5.2 GB.`,
          ),
      },
      { context_window_size: 2048 },
    );
    const loading = engine;
    loading.catch(() => {
      if (engine === loading) stopJournalModel();
    });
  }
  const model = await timed(engine, 600_000);
  current();
  progress("Writing about today...");
  const complete: JournalCompletion = async (messages, seed) => {
    current();
    progress("Writing about today...");
    await timed(model.resetChat(), 15_000);
    current();
    const result = await timed(
      model.chat.completions.create({
        messages,
        seed,
        temperature: 0.6,
        top_p: 0.92,
        frequency_penalty: 0.1,
        max_tokens: 300,
      }),
      180_000,
    );
    current();
    const raw = result.choices[0]?.message.content ?? "";
    const text =
      raw.startsWith("<think>") && !raw.includes("</think>")
        ? ""
        : raw.replace(/^<think>[\s\S]*?<\/think>\s*/, "");
    if (new URLSearchParams(location.search).has("test"))
      console.debug("journal-evaluation", text);
    return text;
  };
  return generateJournal(context, complete);
}

async function timed<T>(work: Promise<T>, milliseconds: number): Promise<T> {
  let waiter:
    | { timer: ReturnType<typeof setTimeout>; reject: (reason: Error) => void }
    | undefined;
  const canceled = new Promise<T>((_, reject) => {
    waiter = {
      reject,
      timer: setTimeout(
        () =>
          stopJournalModel(
            "The journal writer took too long. Your entry is saved; you can retry.",
          ),
        milliseconds,
      ),
    };
    waiters.add(waiter);
  });
  try {
    return await Promise.race([work, canceled]);
  } finally {
    if (waiter) {
      clearTimeout(waiter.timer);
      waiters.delete(waiter);
    }
  }
}

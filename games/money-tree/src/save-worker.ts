import { decode, type State } from "./game";
self.onmessage = async (event: MessageEvent<{ id: number; state: State }>) => {
  const { id, state } = event.data;
  try {
    const raw = JSON.stringify(state);
    if (!decode(raw)) {
      self.postMessage({ id, valid: false });
      return;
    }
    if (typeof CompressionStream === "undefined") {
      self.postMessage({
        id,
        valid: true,
        raw,
        packed: { format: "text", text: raw },
      });
    } else {
      const stream = new Blob([raw])
        .stream()
        .pipeThrough(new CompressionStream("gzip"));
      const bytes = new Uint8Array(await new Response(stream).arrayBuffer());
      self.postMessage(
        { id, valid: true, raw, packed: { format: "gzip", bytes } },
        { transfer: [bytes.buffer] },
      );
    }
  } catch (error) {
    self.postMessage({ id, error: String(error) });
  }
};

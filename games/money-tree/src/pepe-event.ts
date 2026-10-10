import type { State } from "./game";
export const canEnterPepe = (s: State) =>
  !!s.foundMeditationSeeds && !!(s.metStacy || s.stacyConversations);
export function startPepeShow(s: State) {
  if (!canEnterPepe(s) || s.pepeShowStarted) return false;
  s.pepeShowStarted = true;
  s.pepeInflation = 0;
  s.events.push(
    "Chad asked me about inflation, then started inflating an enormous Pepe balloon.",
  );
  return true;
}
export function tickPepeShow(s: State, seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return false;
  if (!s.pepeShowStarted || s.pepePopped) return false;
  s.pepeInflation = Math.min(12, (s.pepeInflation ?? 0) + Math.max(0, seconds));
  if (s.pepeInflation < 12) return false;
  s.pepePopped = true;
  s.events.push(
    "The giant Pepe balloon popped. Green scraps and twenty-five seed packets scattered across Sigma Town.",
  );
  return true;
}
export function collectPepePacket(s: State, index: number) {
  if (
    !s.pepePopped ||
    !Number.isInteger(index) ||
    index < 0 ||
    index >= 25 ||
    s.pepePackets?.includes(index)
  )
    return false;
  s.pepePackets ??= [];
  s.pepePackets.push(index);
  s.seeds += 5;
  s.events.push(
    "Picked up five money seeds from a packet scattered by the Pepe balloon.",
  );
  return true;
}

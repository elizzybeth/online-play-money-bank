import { type State, seedStashSpots } from "./game";
export function nextSeedPacket(s: State): string | null {
  if (!s.boughtSeeds) return null;
  if (!s.foundCapSeeds) return "cap";
  if (!s.foundForestSeeds) return "forest";
  if (!s.foundStoreSeeds) return "store";
  if (!s.foundGardenSeeds) return "garden";
  if (!s.foundTVSeeds) return "tv";
  if (!s.foundMeditationSeeds) return "meditation";
  if (!s.foundStacySeeds) return "stacy";
  return null;
}
export function seedHint(s: State, level: number): string | null {
  const packet = nextSeedPacket(s);
  if (!packet) return null;
  const spot = seedStashSpots[s.seedStashSpot ?? 0];
  const forestDirection =
    spot.z < -20
      ? "northwest"
      : spot.z < 0
        ? "west, near the middle of town"
        : "southwest";
  const lines: Record<string, string[]> = {
    stacy: [
      "Someone in Sigma might appreciate a good listener.",
      "Try the big cowboy-hat building.",
      "Stacy has a story to tell. Ask her about it.",
      "Listen to all ten parts of Stacy’s story inside the cowboy-hat building for the next seeds.",
    ],
    meditation: [
      "Maybe someone in Sigma Town knows where to find more seeds.",
      "Try visiting the Doge house.",
      "The Chads inside Doge are sitting together. Maybe I should join them.",
      "Join the meditation group inside the Doge building to get the next packet.",
    ],
    cap: [
      "Maybe someone in town has missed a little packet.",
      "I should look inside Thread & Thimble.",
      "There might be something tucked into a hat.",
      "Check the brim of the cap inside Thread & Thimble.",
    ],
    forest: [
      "Small things can get lost outside.",
      "I should search among the trees around town.",
      `Try the trees to the ${forestDirection}.`,
      `The packet is at the foot of a tree to the ${forestDirection}, along the western edge of town.`,
    ],
    store: [
      "Maybe a packet was left somewhere familiar.",
      "I should take another look inside Robertsons.",
      "Look around the groceries, beyond the tools.",
      "Check behind the groceries on the right side of Robertsons.",
    ],
    garden: [
      "Maybe the neighbors have something growing besides flowers.",
      "I should search the neighbors’ flowerbeds.",
      "Try the flowerbed near Mabel.",
      "Look closely in the flowerbed east of my garden, near Mabel.",
    ],
    tv: [
      "Maybe I have overlooked something at home.",
      "I should check the living room.",
      "Look behind the furniture near the couch.",
      "The next packet is behind the TV in my living room.",
    ],
  };
  return lines[packet][Math.min(Math.max(0, level), 3)];
}
export class SeedSearchClock {
  private packet: string | null = null;
  private elapsed = 0;
  private delivered = -1;
  update(s: State, seconds: number): string | null {
    const packet = nextSeedPacket(s);
    if (packet !== this.packet) {
      this.packet = packet;
      this.elapsed = 0;
      this.delivered = -1;
    }
    if (!packet) return null;
    this.elapsed += Math.max(0, seconds);
    const level = Math.floor((this.elapsed - 180) / 30);
    if (level < 0 || level <= this.delivered) return null;
    this.delivered = level;
    return seedHint(s, level);
  }
}

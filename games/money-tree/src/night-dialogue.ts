/** Indoor conversations avoid advancing daytime quests during the monster phase. */
const lines: Record<string, string> = {
  mom: "Stay inside with me, love. The Flapping Wallets can’t reach us here, and we’ll let those Cash Cows run themselves tired outside.",
  npc1: "Come into the warm, dear. Flapping Wallets hate a closed door, and a nice cup of tea is much safer than chasing Cash Cows.",
  npc2: "I heard Flapping Wallets at the window. If a Cash Cow lines up a charge, step sideways and find a doorway.",
  npc3: "I brought my flowers in before the Flapping Wallets arrived. Those Cash Cows had better stay out of my beds!",
  robertson:
    "Doors are shut for the night. Flapping Wallets and charging Cash Cows are terrible customers; they never pay for what they break.",
  bicycle:
    "Park your bike somewhere safe tonight. Dodge a Cash Cow sideways, and don’t let a Flapping Wallet corner you outside.",
  grindset:
    "I used to call sleep unproductive. After seeing a Cash Cow charge a Flapping Wallet, I’ve revised my business plan: stay indoors.",
  gigachad:
    "Even I don’t wrestle Cash Cows at night. Save your strength, watch the Flapping Wallets, and take shelter.",
  soyjak:
    "The Flapping Wallets took one look at my pockets and lost interest. The Cash Cows were less understanding.",
  stacy:
    "You’re safe in here. Flapping Wallets swoop, Cash Cows charge straight ahead, and neither deserves your whole evening.",
  "mr-wacky":
    "A Flapping Wallet walks into a bank! A Cash Cow charges the fees! I’m staying indoors until the punchline passes.",
  "willow-guru":
    "Notice the Flapping Wallet without becoming attached to it. When a Cash Cow charges, move your actual feet as well as your consciousness.",
};
export function nightDialogue(id: string) {
  if (lines[id]) return lines[id];
  const variants = [
    "I called it a cash flow problem until the Flapping Wallets started flying. I’m waiting inside for the Cash Cows to leave.",
    "The Cash Cows charge in a straight line, so I step aside. With Flapping Wallets, I prefer the investment strategy called a closed door.",
    "Diamond hands aren’t much protection against Flapping Wallets. Let’s stay in here while the Cash Cows roam.",
    "I thought a Cash Cow meant easy income. Then the Flapping Wallets arrived and I decided to hold my position indoors.",
  ];
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return variants[hash % variants.length];
}
export function hasAlternateChadTopic(id: string) {
  return (
    id.startsWith("doge-meditator-") ||
    ["grindset", "gigachad", "soyjak", "pepe-show", "wolf"].includes(id)
  );
}

export const hats = [
  {
    id: "cap",
    name: "Sprout Cap",
    price: 200,
    color: "#5a9c87",
    power:
      "Plant 15% faster and have a 50% chance to recover one seed per harvest. Check the brim for a surprise.",
  },
  {
    id: "propeller",
    name: "Whirligig",
    price: 800,
    color: "#e76551",
    power: "Walk and run 25% faster.",
  },
  {
    id: "rabbit",
    name: "Spring Hare",
    price: 1200,
    color: "#f5e5ce",
    power: "Press Space to jump.",
  },
  {
    id: "inspector",
    name: "Twin Planter",
    price: 1500,
    color: "#2767ce",
    power:
      "Plant, water, fertilize and harvest two adjoining beds at once. Uses a seed or dose for each bed.",
  },
  {
    id: "hardhat",
    name: "Digging Helmet",
    price: 2000,
    color: "#f0bb42",
    power: "Plant seeds in half the usual time.",
  },
  {
    id: "wizard",
    name: "Moonrise Wizard",
    price: 3000,
    color: "#7867ab",
    power: "50% chance to conserve a fertilizer dose when applying it.",
  },
  {
    id: "rain",
    name: "Rainy Day Sou’wester",
    price: 4000,
    color: "#e9b942",
    power:
      "Automatically water each newly planted seed if you own a watering can.",
  },
  {
    id: "banker",
    name: "Lucky Tallboy",
    price: 6000,
    color: "#343e49",
    power:
      "Add $1 to each harvest, up to $7 normally or $9 for fertilized trees.",
  },
  {
    id: "beekeeper",
    name: "Honey Keeper",
    price: 8000,
    color: "#f3de9b",
    power: "Fertilized trees finishing growth yield at least $6.",
  },
  {
    id: "lantern",
    name: "Night Gardener",
    price: 10000,
    color: "#8e5543",
    power: "Reach interactions from 3 metres away, with a glowing headlamp.",
  },
  {
    id: "terrace",
    name: "Terrace Conductor",
    price: 25000,
    color: "#476c94",
    power:
      "Plant every available site on the same terrace in one action. Uses one seed per site; plants as many as your seeds cover.",
  },
  {
    id: "verdant",
    name: "Verdant Sprout",
    price: 18000,
    color: "#53a974",
    power:
      "Plant 25% faster, with a 60% chance to recover a seed per money-tree harvest.",
  },
  {
    id: "seedkeeper",
    name: "Seedkeeper\u2019s Bonnet",
    price: 35000,
    color: "#d6ba85",
    power: "Recover a seed from 80% of mountain money-tree harvests.",
  },
  {
    id: "harvest",
    name: "Golden Harvest Crown",
    price: 45000,
    color: "#d8b447",
    power: "Earn 20% more from mountain money-tree harvests.",
  },
  {
    id: "compost",
    name: "Compost Curator",
    price: 22000,
    color: "#875d43",
    power: "Collect twice as many scraps when replacing dead money trees.",
  },
  {
    id: "reach",
    name: "Terrace Surveyor",
    price: 28000,
    color: "#9b8eaf",
    power: "Reach garden sites and interactions from 4.5 metres away.",
  },
  {
    id: "trail",
    name: "Summit Strider",
    price: 20000,
    color: "#679aa0",
    power: "Walk and run 35% faster on Mt. Millionaire.",
  },
  {
    id: "alchemist",
    name: "Soil Alchemist",
    price: 30000,
    color: "#8a69b0",
    power:
      "75% chance to conserve fertilizer. Combines with terrace gardening and works at home.",
  },
  {
    id: "dew",
    name: "Dewdrop Tiara",
    price: 24000,
    color: "#79bacb",
    power:
      "Automatically water new home and community crops when you own a watering can.",
  },
  {
    id: "treasury",
    name: "Nest Egg Topper",
    price: 40000,
    color: "#405853",
    power:
      "Automatically put 25% of every net money-tree harvest into your piggy bank.",
  },
] as const;
export type HatId = (typeof hats)[number]["id"];
export const hatById = (id: unknown) => hats.find((h) => h.id === id);

export function hatPower(id: HatId, foundCapSeeds: boolean) {
  const power = hatById(id)!.power;
  return id === "cap" && foundCapSeeds
    ? power.replace(" Check the brim for a surprise.", "")
    : power;
}

export const mountainHats = hats.slice(10);
export const mountainHat = (id: HatId) => mountainHats.some((h) => h.id === id);

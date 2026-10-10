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
    name: "Garden Inspector",
    price: 1500,
    color: "#597a66",
    power: "See every tree’s stage and growth countdown on screen.",
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
] as const;
export type HatId = (typeof hats)[number]["id"];
export const hatById = (id: unknown) => hats.find((h) => h.id === id);

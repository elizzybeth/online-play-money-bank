import { purchasePrice } from "./meals";
import type { State } from "./game";
export const bikes = [
  {
    id: "tassels",
    name: "Ribbon Rider",
    price: 5000,
    speed: 12,
    style: "training",
    color: "#ed8faa",
    description: "Training wheels, pink grips and fluttering rainbow tassels.",
  },
  {
    id: "penny",
    name: "High Society",
    price: 7500,
    speed: 13.5,
    style: "penny",
    color: "#ab8751",
    description: "A huge front wheel, tiny back wheel and a very high saddle.",
  },
  {
    id: "cruiser",
    name: "Sunday Cruiser",
    price: 10000,
    speed: 15,
    style: "cruiser",
    color: "#75bfc0",
    description: "Swept handlebars, cream tires, fenders and a wicker basket.",
  },
  {
    id: "bmx",
    name: "Little Ripper",
    price: 15000,
    speed: 17,
    style: "bmx",
    color: "#ec9a4e",
    description: "Compact frame, chunky tires and axle pegs.",
  },
  {
    id: "city",
    name: "Town Courier",
    price: 22500,
    speed: 19,
    style: "city",
    color: "#6b9672",
    description:
      "An upright town bike with a rear cargo rack and silver fenders.",
  },
  {
    id: "mountain",
    name: "Trail Fox",
    price: 35000,
    speed: 22,
    style: "mountain",
    color: "#8571ba",
    description: "Knobbly tires, suspension forks and a sloping frame.",
  },
  {
    id: "road",
    name: "Carbon Comet",
    price: 50000,
    speed: 25,
    style: "road",
    color: "#35434c",
    description:
      "An endurance carbon frame, narrow tires and curved drop handlebars.",
  },
] as const;
export type BikeId = (typeof bikes)[number]["id"];
export const bikeById = (id: unknown) => bikes.find((b) => b.id === id);
export const bikeShopBounds = { left: -28, right: -8, north: -39, south: -21 };
export const inBikeShop = (p: { x: number; z: number }) =>
  p.x > bikeShopBounds.left &&
  p.x < bikeShopBounds.right &&
  p.z > bikeShopBounds.north &&
  p.z < bikeShopBounds.south;
export function buyBike(s: State, id: BikeId) {
  const bike = bikeById(id);
  if (
    !bike ||
    (s.bikes ?? []).includes(id) ||
    s.cash < purchasePrice(s, bike.price)
  )
    return false;
  s.cash -= purchasePrice(s, bike.price);
  (s.bikes ??= []).push(id);
  s.selectedBike = id;
  s.events.push(`Bought the ${bike.name} bicycle.`);
  return true;
}
export function selectBike(s: State, id: BikeId) {
  if (!(s.bikes ?? []).includes(id)) return false;
  s.selectedBike = id;
  return true;
}
export const bikeFeatures: Record<
  BikeId,
  { name: string; description: string; duration: number; cooldown: number }
> = {
  tassels: {
    name: "Confetti Cannon",
    description: "Fire a colorful burst of confetti.",
    duration: 1,
    cooldown: 8,
  },
  penny: {
    name: "Bubble Parade",
    description: "Float a parade of shimmering bubbles.",
    duration: 5,
    cooldown: 10,
  },
  cruiser: {
    name: "Flower Trail",
    description: "Leave a trail of bright blossoms behind you.",
    duration: 8,
    cooldown: 12,
  },
  bmx: {
    name: "Bunny Hop",
    description: "Hop into the air without losing your forward momentum.",
    duration: 1,
    cooldown: 5,
  },
  city: {
    name: "Party Horn",
    description:
      "Play a cheerful horn chord with a floating parade of musical notes.",
    duration: 6,
    cooldown: 8,
  },
  mountain: {
    name: "Firefly Escort",
    description: "Ride with a little swarm of glowing fireflies.",
    duration: 8,
    cooldown: 12,
  },
  road: {
    name: "Turbo",
    description: "Ride fifty percent faster for five seconds.",
    duration: 5,
    cooldown: 12,
  },
};

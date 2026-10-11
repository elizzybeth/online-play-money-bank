import { fellowship, type Fellowship } from "./millionaire";
const welcomes: Record<Fellowship, string[]> = {
  arms: [
    "Welcome home. There is always room for another pair of hands.",
    "We believe a clear purpose makes even an ordinary Tuesday meaningful.",
    "A strong family starts with showing up, even when nobody is counting.",
    "Our service committee has excellent intentions and an astonishing spreadsheet.",
    "We saved you a place at the potluck. The casserole has already multiplied.",
    "A healthy body, a steady routine, a community you can count on. That is our pitch.",
    "We keep our promises. Some of those promises are printed on surprisingly expensive paper.",
    "Eight arms, one moral compass. It is harder to misplace than you would think.",
    "A little discipline today can become a gift to your family tomorrow.",
    "You do not have to do every good thing. Just find a good thing and do it faithfully.",
    "Certainty is comforting. So are chairs. We have invested in both.",
    "The tractor represents stewardship. The toy hotel represents a different committee.",
    "We talk about building a future together. Sometimes that future has marble columns.",
    "We encourage service, chastity, shared moral standards, health guidelines, and a very organized pantry.",
    "Your family matters here. Your work matters too. Please hydrate.",
    "If you need a hand, ask. We have a statistically unusual number available.",
  ],
  bridge: [
    "Welcome. Your potential is not limited to the story you have been told about yourself.",
    "Learning does not end at graduation. Neither does our course catalogue.",
    "A new perspective can feel like opening a window in a room you forgot had windows.",
    "This meter has a needle. I have a vision. Together we have a presentation.",
    "Come as you are. We will help you discover who you might become.",
    "Some days a little confidence is the most useful tool you own.",
    "Our promise is total freedom. The orientation binder is less portable.",
    "There is more to a person than their genes and circumstances. We take that idea very far.",
    "We speak of a guiding spiritual core. Mine apparently enjoys gardening.",
    "We like measurable progress. I have drawn an upward arrow next to your name.",
    "We offer emotional relief, connection, and several increasingly ambitious levels.",
    "You can ask questions here. Occasionally the answer has its own prerequisite.",
    "A bridge is built one step at a time. Ours has a particularly enthusiastic treasurer.",
    "Our doctrine rejects psychiatric drugs and modern medicine. You should make your own health decisions with qualified clinicians.",
    "Self-improvement is a lifelong project. You are allowed to take lunch breaks.",
    "Welcome to the learning circle. The circle keeps getting larger; so does the stationery budget.",
  ],
  fire: [
    "Welcome, gardener. Let your shoulders drop before you decide what comes next.",
    "A walk among trees can change the shape of a difficult morning.",
    "Movement is part of our practice. So is remembering where we put our shoes.",
    "We wear white to remind ourselves of openness. Soil remains unconvinced.",
    "Breathe deeply and work gently. Your worth is not measured by the number of beds you planted.",
    "We seek transformation without forgetting to wash the dishes.",
    "A plant-based potluck is waiting below. The lentils have excellent social skills.",
    "Balance is a practice, not a permanent achievement. Ask either of my heads.",
    "Live consciously in the world. Notice who your choices reach.",
    "Nature does not rush every season. You do not have to either.",
    "Our two heads disagree about yoga playlists. They agree about kindness.",
    "Stretch, breathe, pay attention. Those are small things you can return to.",
    "Some people call it releasing energetic blocks. Sometimes I just call it finally going for a walk.",
    "Expanded consciousness is a lovely aim. A comfortable cushion is a useful beginning.",
    "Let resources circulate. Also check where they actually go.",
    "We welcome your curiosity, your movement, and your entirely practical watering can.",
  ],
};
const excuses = [
  "The floors were just polished. They are reflecting more light than our doctrine allows.",
  "The foyer is being re-foyered. We discovered it needed a second foyer.",
  "My cousin is sorting the ornamental spoons by spiritual significance.",
  "The chandelier is receiving its annual chandelier blessing.",
  "The household is observing a private silence. The leaf blower is exempt.",
  "The indoor fountain has developed an inconvenient sense of timing.",
  "The guest wing is full of guest-wing catalogues.",
  "Our staircase consultant says the stairs need some space.",
  "The velvet is resting. We must respect its process.",
  "The marble is acclimating to its new marble climate.",
  "The security system has not met you yet and it is very shy.",
  "The house is being photographed for a modest-living brochure.",
  "We have misplaced the tiny key to the very large door.",
  "The yacht cushions are drying in every available room.",
  "The car lift is performing a very slow demonstration.",
  "The butler is on a break from explaining why we need a butler.",
  "The curtains are having their privacy inspected.",
  "A delivery of additional columns is blocking the hallway.",
  "The rug is older than the house and taking it personally.",
  "We are rearranging the furniture into a more humble configuration.",
  "The gold leaf is still settling. Apparently it takes its time.",
  "The doorbell committee has not reached a consensus.",
  "The library is temporarily all coffee-table books about libraries.",
  "Our dining table is booked for a table-setting rehearsal.",
  "The pantry has exceeded its allotted number of pantries.",
  "The indoor garden is undergoing a surprisingly expensive outdoor simulation.",
  "The monogrammed towels are in a naming dispute.",
  "The home cinema is screening the home cinema installation video.",
  "The conservatory is conserving access for now.",
  "The estate manager says the estate needs a little alone time.",
];
export function terraceLine(id: Fellowship, count: number) {
  const lines = welcomes[id];
  return lines[count % lines.length];
}
export function mansionLine(id: Fellowship, count: number) {
  const thanks =
    id === "arms"
      ? "Your faithful stewardship has been such a blessing. We give thanks for the abundance entrusted to us."
      : id === "bridge"
        ? "Your work is helping our children move higher on the bridge. We celebrate the boundless potential of the spirit."
        : "Your loving work keeps the energy flowing. We give thanks to the light within every living thing.";
  return `${thanks} I’m sorry I can’t invite you inside. ${excuses[count % excuses.length]} Would you like to buy my app for $5?`;
}
export function summitConversation(id: Fellowship) {
  const name = fellowship(id).name;
  return [
    [
      `I’m so glad you have joined ${name}. Every terrace here is fertile. Plant directly in the soil; your trees will grow as if they have already been fertilized.`,
      "What’s the catch?",
    ],
    [
      fellowship(id).tithe +
        " Ten percent of anything new you earn goes back to your community.",
      "Like, my neighbors?",
    ],
    ["No, not them.", "Then who?"],
    [
      `To the Children of ${name}.`,
      "But I’ve only ever seen them on Mt. Millionaire.",
    ],
    [
      "Happy planting! Here are 25 seed packets to get you started.",
      "Accept the seeds and the 10% contribution",
    ],
  ];
}

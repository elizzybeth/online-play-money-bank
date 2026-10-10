import type { State } from "./game";
import { momStatus } from "./game";
const groups = {
  resting: [
    "She looks so small on that couch.",
    "I wish resting could fix everything.",
    "I can stay a little longer.",
    "Her eyes look tired even when she smiles.",
    "I should keep my voice down.",
    "I hate seeing her this worn out.",
    "Maybe sitting here helps a little.",
    "I want her to feel better already.",
    "She is trying hard to sound okay.",
    "I wish she did not have to try so hard.",
  ],
  restingAgain: [
    "The couch won again today.",
    "Another quiet day for her.",
    "I keep hoping she will be up when I come in.",
    "I know she needs rest. I still hate this.",
    "I miss hearing her moving around the house.",
    "I should not rush her.",
    "I can tell her about town while she rests.",
    "I wish I knew what would help.",
    "She has been tired for so long.",
    "I can be here without making her talk.",
  ],
  good: [
    "It is nice seeing her up.",
    "She sounds more like herself today.",
    "I almost forgot how nice an ordinary day feels.",
    "I want today to last longer.",
    "Maybe we can do something together.",
    "I am glad she has some energy.",
    "She looks happier being busy.",
    "I should enjoy this while we have it.",
    "I can stop worrying for a minute. Maybe.",
    "I love hearing her excited about something.",
  ],
  cooking: [
    "The house feels right when she is cooking.",
    "I should help with the washing up.",
    "I like being in the kitchen with her.",
    "Dinner together sounds pretty good.",
    "I wish every day could smell like dinner.",
    "She seems pleased to be making something.",
    "I can pass things so she does not have to reach.",
    "Maybe I will ask her to teach me next time.",
    "I do not care what we eat. I like her being here.",
    "I should make sure she sits down when she needs to.",
  ],
  birdhouses: [
    "I hope a bird actually moves in.",
    "She is making something tiny and safe.",
    "I could help paint one.",
    "Maybe we can hang them up together.",
    "She likes having a job for her hands.",
    "A birdhouse is a good use of a good day.",
    "I wonder what color the birds would pick.",
    "I want to hear how the pieces fit.",
    "I could hold the wood steady for her.",
    "I hope she gets to see a nest in there.",
  ],
  painting: [
    "I like watching her choose colors.",
    "She looks less tired talking about painting.",
    "Maybe she will let me add a tiny bit.",
    "I want to keep what she makes.",
    "She sees colors I would never think to use.",
    "I could wash the brushes for her.",
    "I hope she has energy to finish.",
    "I like that she is making something just because she wants to.",
    "Maybe I should ask what she wants to paint next.",
    "I want more afternoons like this one.",
  ],
  reading: [
    "I wonder what her book is about.",
    "I can sit here without interrupting.",
    "Reading looks like a nicer kind of resting.",
    "Maybe she will tell me the story later.",
    "I like seeing her interested in something.",
    "She can have some quiet. I will be nearby.",
    "I wonder if the book has a happy ending.",
    "I should ask if she wants anything before I go.",
    "I used to like it when she read to me.",
    "Maybe we could read together for a bit.",
  ],
  garden: [
    "She has a point. The trees are weird-looking.",
    "I am glad she came to see what I am doing.",
    "Her saying thank you makes digging feel easier.",
    "I wish I could grow something prettier too.",
    "Maybe I will plant normal flowers for her.",
    "I want this garden to be worth the trouble.",
    "She noticed my work. That feels good.",
    "Ugly trees are okay if they help her.",
    "I like having her out here with me.",
    "I hope she can enjoy the garden without getting worn out.",
  ],
  noSeeds: [
    "I still have to figure out how to help.",
    "I cannot keep just thinking about money.",
    "Maybe someone in town will have an idea.",
    "I wish I knew where to start.",
    "I need to do something useful today.",
    "There has to be something I can try.",
    "I should talk to Robertson.",
    "I am scared of how much we need.",
    "I do not want her worrying about money too.",
    "I wish helping her was as easy as helping with chores.",
  ],
  seeds: [
    "I bought seeds. I hope that was not stupid.",
    "What if Robertson was only joking?",
    "These seeds had better do something.",
    "I still cannot believe I paid for money seeds.",
    "I need to give those seeds a chance.",
    "Maybe the garden really can help. Maybe.",
    "I wish I could be sure before I tell her.",
    "I have not figured these seeds out yet.",
    "It would be easier if this made any sense.",
    "I cannot keep the seeds in my bag forever.",
  ],
  planted: [
    "I put the seeds in. Now I have to wait.",
    "I wish I could dig up an answer instead.",
    "I keep thinking about what is under that dirt.",
    "I want to see something come up.",
    "I should check the garden after this.",
    "Waiting is harder than digging.",
    "Maybe something is happening that I cannot see.",
    "I hope I planted them properly.",
    "I keep wondering whether I did enough.",
    "It feels strange leaving the garden alone.",
  ],
  growing: [
    "The trees are growing. That has to count for something.",
    "I keep wanting to check them again.",
    "I hope those branches really grow bills.",
    "It still feels like a trick watching them grow.",
    "I want to show her when I am sure it works.",
    "I have to let the trees take their time.",
    "Something is actually happening out there.",
    "I should be patient. I am bad at being patient.",
    "Maybe next time I check they will be ready.",
    "I wish Mom could get better as fast as a tree grows.",
  ],
  ready: [
    "There is money waiting outside. Real money.",
    "I should pick those bills before I forget.",
    "I want to count what the trees made.",
    "It is still weird having dollars on branches.",
    "Maybe I can bring her some good news.",
    "I need to see how much is actually there.",
    "I cannot leave the money out there all day.",
    "I keep thinking about those green bills.",
    "This might finally make sense.",
    "I should count it before I tell her what I found.",
  ],
  harvested: [
    "The money was real. I keep remembering that.",
    "I picked dollars off a tree. That happened.",
    "I have never earned money like this before.",
    "I want to do it again and make sure it was not luck.",
    "Maybe I really can help with this.",
    "I keep expecting the bills to turn back into leaves.",
    "I wish I could show her how it happened.",
    "The garden did more than I thought it could.",
    "I am still getting used to what those trees do.",
    "It makes me feel a little less helpless.",
  ],
  smallSavings: [
    "We still need so much more.",
    "I can count our money without getting very far.",
    "I wish the hospital needed less.",
    "A few dollars matter. They do not feel like enough.",
    "I have to keep finding ways to earn more.",
    "I should save what I can.",
    "I keep thinking how far we have to go.",
    "I want the number we need to get smaller.",
    "It is hard not to think about the money.",
    "I wish there was a faster way to get there.",
  ],
  someSavings: [
    "We have more saved than we used to.",
    "It is starting to feel like actual savings.",
    "I need to keep some money safe for her.",
    "I should be careful about what I spend next.",
    "The money is adding up even if it is slow.",
    "I want to keep going while the garden works.",
    "I can see my work is helping a little.",
    "There is a lot to do. But I have done something.",
    "I wish I could promise her how soon we will have enough.",
    "I am getting better at saving instead of just hoping.",
  ],
  nearGoal: [
    "We are getting close. I am scared to get excited.",
    "I keep counting because I want to be sure.",
    "I do not want to waste anything this close.",
    "Maybe there will be enough soon.",
    "I should check the piggy bank again later.",
    "I wish getting money made me stop being scared.",
    "I can almost imagine telling her we have enough.",
    "I need to keep doing what has been working.",
    "We are closer than I thought we would get.",
    "I want to finish this so badly.",
  ],
  goal: [
    "We have enough money. I still want her to be okay.",
    "I can stop worrying about money for a minute.",
    "I hope having enough makes the next part easier.",
    "I want to tell her the money is ready.",
    "I counted it. We really have enough.",
    "The garden helped us get here.",
    "I am glad I kept trying.",
    "I thought having enough would make me less scared.",
    "I hope we can get her the help she needs now.",
    "I just want more time with her.",
  ],
  returned: [
    "I am glad to be back with her.",
    "Town feels far away when I get home.",
    "I should ask how she has been.",
    "I wonder if she missed me while I was out.",
    "I can stay home a little before going out again.",
    "I want to tell her about my walk.",
    "Seeing her feels better than wondering how she is.",
    "I am here now. I can help with something.",
    "I should put my things down and listen.",
    "I like knowing where she is.",
  ],
  sitting: [
    "I can just sit here for a while.",
    "We do not have to talk the whole time.",
    "I like being close to her.",
    "The garden can wait a few minutes.",
    "I wish we could stay like this longer.",
    "I am glad there is room beside her.",
    "Maybe sitting together helps both of us.",
    "I do not need an answer right now.",
    "I want to remember this ordinary little moment.",
    "I can hear her breathing from here.",
  ],
} as const;
export const momThoughtLibrary = Object.entries(groups).flatMap(
  ([group, lines]) =>
    lines.map((text, index) => ({ id: `${group}-${index}`, group, text })),
);
export function chooseMomThought(
  s: State,
  occasion: "talk" | "returned" | "sitting" = "talk",
) {
  const status = momStatus(s.day);
  const eligible = new Set<string>([
    status.energetic ? "good" : "resting",
    status.activity,
  ]);
  if (!status.energetic && status.activity !== "bedrest" && s.day > 1)
    eligible.add("restingAgain");
  if (occasion !== "talk") eligible.add(occasion);
  if (!s.boughtSeeds) eligible.add("noSeeds");
  else if (s.events.some((e) => e.startsWith("Harvested")))
    eligible.add("harvested");
  else if (s.plots.some((p) => p.stage === "ready")) eligible.add("ready");
  else if (s.plots.some((p) => p.stage === "growing")) eligible.add("growing");
  else if (s.plots.some((p) => p.stage === "planted")) eligible.add("planted");
  else if (s.seeds > 0) eligible.add("seeds");
  const total = s.cash + s.bank;
  eligible.add(
    total >= 1000000
      ? "goal"
      : total >= 800000
        ? "nearGoal"
        : total >= 10000
          ? "someSavings"
          : "smallSavings",
  );
  const history = (s.momThoughts ??= []);
  const candidates = momThoughtLibrary.filter(
    (t) =>
      eligible.has(t.group) &&
      !(status.activity === "bedrest" && /couch|sitting here/.test(t.text)),
  );
  let unused = candidates.filter((t) => !history.includes(t.id));
  if (!unused.length) {
    const oldest = Math.min(
      ...candidates.map((t) => history.lastIndexOf(t.id)),
    );
    unused = candidates.filter((t) => history.lastIndexOf(t.id) === oldest);
  }
  const selected = unused[Math.floor(Math.random() * unused.length)];
  history.push(selected.id);
  s.momThoughts = history.slice(-200);
  return selected.text;
}

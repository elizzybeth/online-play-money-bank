import type { State } from "./game";
export type NewsReport = { day: number; headline: string; report: string };
export function newsReports(s: State): NewsReport[] {
  const reports: NewsReport[] = [];
  if (s.day <= 3)
    reports.push({
      day: 1,
      headline: "Spoke & Saddle opens",
      report:
        "Spoke & Saddle has opened its doors with seven bicycles, from a little bike with training wheels to a carbon road bike. Riders can browse the new showroom just off the lane.",
    });
  for (const memory of [
    ...(s.journalHistory ?? []).filter((m) => m.day >= s.day - 2),
    { day: s.day, events: s.events },
  ]) {
    const events = memory.events.join("\n");
    if (/Found five money seeds behind the TV/.test(events))
      reports.push({
        day: memory.day,
        headline: "A path to Sigma Town",
        report:
          "The hedge at the end of the lane now has a passage to Sigma Town. Visitors will find Grindset coffee, a community garden, and quite a lot of advice from men named Chad.",
      });
    if (/enormous Pepe balloon/.test(events))
      reports.push({
        day: memory.day,
        headline: "Pepe grows and grows",
        report:
          "An unusual inflation demonstration has begun in Sigma Town. The giant green Pepe head is swelling like a balloon while the presenter asks whether inflation is a good thing.",
      });
    if (/giant Pepe balloon popped/.test(events))
      reports.push({
        day: memory.day,
        headline: "Green scraps across Sigma",
        report:
          "The enormous Pepe balloon has burst. Gardeners are gathering green rubber scraps and twenty-five packets of money seeds from around Sigma Town; nobody has reported an injury.",
      });
    if (/gap opened behind Sigma Town/.test(events))
      reports.push({
        day: memory.day,
        headline: "Willow path revealed",
        report:
          "A new gap behind Sigma Town leads to a willow grove. Visitors report a guru offering personality assessments and three unusually enthusiastic spiritual communities.",
      });
    if (/left the terraces to build lavish mansions/.test(events))
      reports.push({
        day: memory.day,
        headline: "A building boom at Mt. Millionaire",
        report:
          "Lavish new mansions are rising below the white terraces of Mount Millionaire. Former terrace residents have moved into the estates, where fancy cars and yachts are beginning to appear.",
      });
    if (/Picked paint colors for two birdhouses/.test(events))
      reports.push({
        day: memory.day,
        headline: "New homes for local birds",
        report:
          "Two newly painted birdhouses have been hung in the neighborhood trees. A mother and her child chose the colors together, and local birds are inspecting the new accommodation.",
      });
  }
  return reports.length
    ? reports.reverse()
    : [
        {
          day: s.day,
          ...[
            {
              headline: "Gardening takes root",
              report:
                "The neighborhood gardening craze continues, with residents comparing seedlings and making room for more flowerbeds. Our garden desk is following developments from the potting shed.",
            },
            {
              headline: "Birdwatchers look up",
              report:
                "Birdwatchers are keeping an eye on the trees around town as familiar birds make their morning rounds. Residents are invited to watch quietly and leave the branches undisturbed.",
            },
            {
              headline: "The lane in bloom",
              report:
                "Flowers along the shopping lane are drawing admiring looks from passersby. Shopkeepers say the beds have become a favorite stop on the walk into town.",
            },
          ][s.day % 3],
        },
      ];
}

/** Current-day events are append-only; archived days are immutable. State/array
 * replacement and day rollover also invalidate the feed (including save import). */
export function createNewsFeed() {
  let state: State | undefined;
  let day = -1,
    eventCount = -1,
    historyCount = -1,
    builds = 0;
  let events: State["events"] | undefined;
  let history: State["journalHistory"];
  let reports: NewsReport[] = [];
  return {
    get builds() {
      return builds;
    },
    read(s: State) {
      if (
        state !== s ||
        day !== s.day ||
        events !== s.events ||
        eventCount !== s.events.length ||
        history !== s.journalHistory ||
        historyCount !== (s.journalHistory?.length ?? 0)
      ) {
        reports = newsReports(s);
        state = s;
        day = s.day;
        events = s.events;
        eventCount = s.events.length;
        history = s.journalHistory;
        historyCount = history?.length ?? 0;
        builds++;
      }
      return reports;
    },
  };
}

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
          "An unusual inflation demonstration has begun in Sigma Town. The giant green Pepe head is swelling like a balloon. The presenter has asked whether inflation is a good thing. We are still waiting for a clear answer.",
      });
    if (/giant Pepe balloon popped/.test(events))
      reports.push({
        day: memory.day,
        headline: "Green scraps across Sigma",
        report:
          "The enormous Pepe balloon has burst. Green rubber scraps and twenty-five packets of money seeds have landed around Sigma Town. Nobody has reported an injury. Gardeners are picking up the packets.",
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
          "Lavish new mansions are rising below the white terraces of Mt. Millionaire. Former terrace residents have moved into the estates, where fancy cars and yachts are beginning to appear.",
      });
    if (/Picked paint colors for two birdhouses/.test(events))
      reports.push({
        day: memory.day,
        headline: "New homes for local birds",
        report:
          "Two newly painted birdhouses have been hung in the neighborhood trees. A mother and her child chose the colors and put them up together. We wish their first feathered tenants a happy move-in.",
      });
  }
  return reports.length
    ? reports.reverse()
    : [
        {
          day: s.day,
          headline: "A quiet day in town",
          report:
            "No new major events to report this morning. Neighbors are tending their gardens, the shops are open, and birds have been spotted around the trees. We will bring you more local news as it happens.",
        },
      ];
}

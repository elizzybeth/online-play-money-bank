import { test } from "node:test";
import assert from "node:assert/strict";
import { HomeAudio } from "../src/home-audio";
function audioMock() {
  const tones: any[] = [],
    filters: any[] = [];
  const param = () => ({
    value: 0,
    setValueAtTime() {},
    exponentialRampToValueAtTime() {},
    linearRampToValueAtTime() {},
  });
  const node = () => ({
    connect() {},
    disconnect() {},
    frequency: param(),
    gain: param(),
    Q: param(),
  });
  const context = {
    currentTime: 10,
    state: "running",
    destination: {},
    createGain: node,
    createOscillator() {
      const tone = {
        ...node(),
        type: "",
        start() {},
        stops: [] as number[],
        stop(time?: number) {
          this.stops.push(time ?? context.currentTime);
        },
      };
      tones.push(tone);
      return tone;
    },
    createBiquadFilter() {
      const filter = { ...node(), type: "" };
      filters.push(filter);
      return filter;
    },
    createBufferSource() {
      throw new Error("Household audio must not create looping noise");
    },
  };
  return { context, tones, filters };
}
test("keyboard and cartoons play finite notes, rate limit scheduling, and stop on leaving", () => {
  for (const mode of ["keyboard", "cartoons"]) {
    const { context, tones } = audioMock(),
      sound = new HomeAudio();
    sound.update(context as unknown as AudioContext, mode, 0.02);
    sound.update(context as unknown as AudioContext, mode, 0.02);
    assert.equal(tones.length, 1);
    assert.equal(tones[0].type, "triangle");
    assert.ok(tones[0].stops[0] > 10 && tones[0].stops[0] < 10.5);
    sound.update(context as unknown as AudioContext, "", 0);
    assert.equal(tones[0].stops.at(-1), 10);
  }
});
test("news uses a muffled voice formant and suspending audio cancels its voice", () => {
  const { context, tones, filters } = audioMock(),
    sound = new HomeAudio();
  sound.update(context as unknown as AudioContext, "news", 0.02);
  assert.equal(filters[0].type, "bandpass");
  assert.equal(tones[0].type, "sawtooth");
  context.state = "suspended";
  sound.update(context as unknown as AudioContext, "news", 0.02);
  assert.equal(tones[0].stops.at(-1), 10);
});

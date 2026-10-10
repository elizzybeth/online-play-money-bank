import { test } from "node:test";
import assert from "node:assert/strict";
import {
  enableBalloonAudio,
  balloonSound,
  setBalloonMuted,
} from "../src/balloon-audio";
test("sound-off also silences the separately initialized balloon audio", () => {
  const original = globalThis.AudioContext;
  let started = 0,
    created = 0;
  const node = () => ({
    connect() {},
    start() {
      started++;
    },
    stop() {},
    frequency: {
      value: 0,
      setValueAtTime() {},
      exponentialRampToValueAtTime() {},
    },
  });
  class FakeContext {
    state = "running";
    currentTime = 0;
    sampleRate = 100;
    destination = {};
    constructor() {
      created++;
    }
    resume() {
      this.state = "running";
      return Promise.resolve();
    }
    suspend() {
      this.state = "suspended";
      return Promise.resolve();
    }
    createGain() {
      return {
        connect() {},
        gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} },
      };
    }
    createOscillator() {
      return node();
    }
    createBufferSource() {
      return { ...node(), buffer: null };
    }
    createBuffer(_channels: number, size: number) {
      return { getChannelData: () => new Float32Array(size) };
    }
  }
  globalThis.AudioContext = FakeContext as unknown as typeof AudioContext;
  try {
    setBalloonMuted(true);
    enableBalloonAudio();
    balloonSound();
    assert.equal(created, 0);
    setBalloonMuted(false);
    enableBalloonAudio();
    balloonSound();
    assert.equal(started, 1);
    setBalloonMuted(true);
    balloonSound();
    balloonSound(true);
    assert.equal(started, 1);
    setBalloonMuted(false);
    balloonSound(true);
    assert.equal(started, 2);
  } finally {
    globalThis.AudioContext = original;
  }
});

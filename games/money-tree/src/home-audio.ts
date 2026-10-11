/** Short, positional household sounds. No looping noise source. */
export class HomeAudio {
  private mode = "";
  private next = 0;
  private beat = 0;
  private tones = new Set<OscillatorNode>();
  stop() {
    for (const tone of this.tones) {
      try {
        tone.stop();
      } catch {}
    }
    this.tones.clear();
    this.mode = "";
    this.next = 0;
  }
  update(context: AudioContext | undefined, mode: string, volume: number) {
    if (!context || !mode || volume <= 0 || context.state !== "running") {
      this.stop();
      return;
    }
    if (mode !== this.mode) {
      this.stop();
      this.mode = mode;
      this.beat = 0;
    }
    const now = context.currentTime;
    if (now < this.next) return;
    const news = mode === "news",
      keyboard = mode === "keyboard";
    const notes = keyboard
      ? [261.63, 329.63, 392, 329.63, 293.66, 349.23, 392, 523.25]
      : [523.25, 659.25, 783.99, 659.25, 698.46, 587.33, 523.25, 783.99];
    const duration = news ? 0.24 : keyboard ? 0.46 : 0.22;
    const tone = context.createOscillator(),
      gain = context.createGain();
    tone.type = news ? "sawtooth" : "triangle";
    tone.frequency.setValueAtTime(
      news ? 170 + (this.beat % 4) * 26 : notes[this.beat % notes.length],
      now,
    );
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    if (news) {
      const filter = context.createBiquadFilter();
      filter.type = "bandpass";
      filter.Q.value = 3;
      filter.frequency.setValueAtTime(400, now);
      filter.frequency.linearRampToValueAtTime(1000, now + duration / 2);
      filter.frequency.linearRampToValueAtTime(450, now + duration);
      tone.connect(filter);
      filter.connect(gain);
    } else tone.connect(gain);
    gain.connect(context.destination);
    this.tones.add(tone);
    tone.onended = () => {
      this.tones.delete(tone);
      tone.disconnect();
      gain.disconnect();
    };
    tone.start(now);
    tone.stop(now + duration + 0.01);
    this.beat++;
    this.next = now + duration + (this.beat % 8 === 0 ? 0.7 : 0.065);
  }
}

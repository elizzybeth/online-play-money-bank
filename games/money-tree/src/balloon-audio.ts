let context: AudioContext | undefined;
export function enableBalloonAudio() {
  try {
    context ??= new AudioContext();
    void context.resume();
  } catch {
    /* Visual event works without audio support. */
  }
}
export function balloonSound(pop = false) {
  if (!context || context.state !== "running") return;
  const duration = pop ? 0.4 : 0.3,
    t = context.currentTime;
  const gain = context.createGain();
  gain.connect(context.destination);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(pop ? 0.18 : 0.035, t + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  if (pop) {
    const buffer = context.createBuffer(
        1,
        Math.ceil(context.sampleRate * duration),
        context.sampleRate,
      ),
      data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++)
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(gain);
    source.start(t);
    source.stop(t + duration);
  } else {
    const oscillator = context.createOscillator();
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(180, t);
    oscillator.frequency.exponentialRampToValueAtTime(550, t + duration);
    oscillator.connect(gain);
    oscillator.start(t);
    oscillator.stop(t + duration);
  }
}

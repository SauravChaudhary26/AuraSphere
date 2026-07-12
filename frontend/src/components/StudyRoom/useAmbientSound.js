import { useCallback, useEffect, useRef, useState } from "react";

/** All soundscapes. `premium` ones unlock with the store Focus Sound Pack. */
export const AMBIENT_OPTIONS = [
  { value: "rain", label: "Rain 🌧" },
  { value: "waves", label: "Waves 🌊" },
  { value: "deep", label: "Deep 🎧" },
  { value: "fire", label: "Fireplace 🔥", premium: true },
  { value: "forest", label: "Forest 🌲", premium: true },
  { value: "night", label: "Night 🦗", premium: true },
];

let ambientCtx = null;
const bufferCache = {};

function getCtx() {
  if (!ambientCtx) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      ambientCtx = AC ? new AC() : null;
    } catch {
      ambientCtx = null;
    }
  }
  if (ambientCtx && ambientCtx.state === "suspended") ambientCtx.resume().catch(() => {});
  return ambientCtx;
}

// 2s looping noise buffers: white for rain hiss, integrated ("brown") for waves/deep rumble.
function getNoiseBuffer(ctx, type) {
  if (bufferCache[type]) return bufferCache[type];
  const len = ctx.sampleRate * 2;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  if (type === "white") {
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  } else {
    let last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      last = (last + 0.02 * w) / 1.02;
      d[i] = last * 3.5;
    }
  }
  bufferCache[type] = buf;
  return buf;
}

function buildGraph(ctx, kind, volume) {
  const master = ctx.createGain();
  const nodes = [master];
  const sources = [];
  const timers = []; // one-shot schedulers (crackles/chirps); cleared on stop
  const src = ctx.createBufferSource();
  src.loop = true;
  let base = 0.35;

  if (kind === "rain") {
    src.buffer = getNoiseBuffer(ctx, "white");
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 2200; // ~1000-4000Hz band
    bp.Q.value = 0.7;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.3;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.05; // subtle shimmer on top of the base gain
    lfo.connect(lfoGain).connect(master.gain);
    lfo.start();
    src.connect(bp).connect(master);
    sources.push(lfo);
    nodes.push(bp, lfoGain);
    base = 0.3;
  } else if (kind === "waves") {
    src.buffer = getNoiseBuffer(ctx, "brown");
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 700;
    const swell = ctx.createGain();
    swell.gain.value = 0.6;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.08; // slow tide swell
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.35;
    lfo.connect(lfoGain).connect(swell.gain);
    lfo.start();
    src.connect(lp).connect(swell).connect(master);
    sources.push(lfo);
    nodes.push(lp, swell, lfoGain);
    base = 0.5;
  } else if (kind === "fire") {
    // Fireplace (premium): warm rumble + a random crackle scheduler.
    src.buffer = getNoiseBuffer(ctx, "brown");
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 380;
    const flick = ctx.createOscillator();
    flick.frequency.value = 7.3; // flame flicker wobble
    const flickGain = ctx.createGain();
    flickGain.gain.value = 0.05;
    flick.connect(flickGain).connect(master.gain);
    flick.start();
    src.connect(lp).connect(master);
    sources.push(flick);
    nodes.push(lp, flickGain);
    base = 0.55;

    const scheduleCrackle = () => {
      timers[0] = setTimeout(() => {
        try {
          const c = ctx.createBufferSource();
          c.buffer = getNoiseBuffer(ctx, "white");
          const hp = ctx.createBiquadFilter();
          hp.type = "highpass";
          hp.frequency.value = 1600 + Math.random() * 1800;
          const g = ctx.createGain();
          const t = ctx.currentTime;
          const dur = 0.02 + Math.random() * 0.06;
          g.gain.setValueAtTime(0.25 + Math.random() * 0.45, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + dur);
          c.connect(hp).connect(g).connect(master);
          c.start(t, Math.random() * 1.5, dur + 0.05);
        } catch {
          /* context torn down mid-schedule */
        }
        scheduleCrackle();
      }, 120 + Math.random() * 650);
    };
    scheduleCrackle();
  } else if (kind === "forest") {
    // Forest (premium): soft wind swell + occasional bird chirps.
    src.buffer = getNoiseBuffer(ctx, "brown");
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 520;
    const swell = ctx.createGain();
    swell.gain.value = 0.65;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.06;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.25;
    lfo.connect(lfoGain).connect(swell.gain);
    lfo.start();
    src.connect(lp).connect(swell).connect(master);
    sources.push(lfo);
    nodes.push(lp, swell, lfoGain);
    base = 0.45;

    const scheduleChirp = () => {
      timers[0] = setTimeout(() => {
        try {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
          if (pan) pan.pan.value = Math.random() * 1.2 - 0.6;
          osc.type = "sine";
          const t = ctx.currentTime;
          const f0 = 2100 + Math.random() * 900;
          const notes = 2 + ((Math.random() * 2) | 0);
          g.gain.setValueAtTime(0, t);
          for (let n = 0; n < notes; n++) {
            const tn = t + n * (0.13 + Math.random() * 0.07);
            osc.frequency.setValueAtTime(f0 * (0.95 + Math.random() * 0.1), tn);
            osc.frequency.exponentialRampToValueAtTime(f0 * (1.2 + Math.random() * 0.2), tn + 0.06);
            g.gain.setValueAtTime(0, tn);
            g.gain.linearRampToValueAtTime(0.1 + Math.random() * 0.06, tn + 0.02);
            g.gain.exponentialRampToValueAtTime(0.001, tn + 0.11);
          }
          const end = t + notes * 0.22 + 0.1;
          if (pan) osc.connect(g).connect(pan).connect(master);
          else osc.connect(g).connect(master);
          osc.start(t);
          osc.stop(end);
        } catch {
          /* context torn down mid-schedule */
        }
        scheduleChirp();
      }, 2800 + Math.random() * 5500);
    };
    scheduleChirp();
  } else if (kind === "night") {
    // Night (premium): cricket chorus over a faint low bed.
    src.buffer = getNoiseBuffer(ctx, "brown");
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 260;
    const bed = ctx.createGain();
    bed.gain.value = 0.4;
    src.connect(lp).connect(bed).connect(master);
    nodes.push(lp, bed);

    // Two detuned carriers, pulsed at ~28Hz (chirp) inside ~1Hz bursts.
    const level = ctx.createGain();
    level.gain.value = 0.06;
    const chirpGate = ctx.createGain();
    chirpGate.gain.value = 0.5;
    const burstGate = ctx.createGain();
    burstGate.gain.value = 0.5;
    for (const f of [4150, 4480]) {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = f;
      osc.connect(chirpGate);
      osc.start();
      sources.push(osc);
    }
    const mkGate = (target, freq) => {
      const lfo = ctx.createOscillator();
      lfo.type = "square";
      lfo.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.value = 0.5; // square −1..1 → gate 0..1 around the 0.5 base
      lfo.connect(g).connect(target.gain);
      lfo.start();
      sources.push(lfo);
      nodes.push(g);
    };
    mkGate(chirpGate, 28);
    mkGate(burstGate, 1.05);
    chirpGate.connect(burstGate).connect(level).connect(master);
    nodes.push(chirpGate, burstGate, level);
    base = 0.5;
  } else {
    // deep
    src.buffer = getNoiseBuffer(ctx, "brown");
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 220;
    src.connect(lp).connect(master);
    nodes.push(lp);
    base = 0.6;
  }

  master.gain.value = volume * base;
  master.connect(ctx.destination);
  src.start();
  sources.push(src);
  return { sources, nodes, master, base, timers };
}

function stopGraph(graph) {
  if (!graph) return;
  (graph.timers || []).forEach((id) => clearTimeout(id));
  graph.sources.forEach((s) => { try { s.stop(); } catch {} });
  graph.sources.forEach((s) => { try { s.disconnect(); } catch {} });
  graph.nodes.forEach((n) => { try { n.disconnect(); } catch {} });
}

export default function useAmbientSound() {
  const [ambient, setAmbient] = useState("off"); // "off" | AMBIENT_OPTIONS[].value
  const [volume, setVolumeState] = useState(0.5);
  const graphRef = useRef(null);
  const volumeRef = useRef(0.5);

  const setVolume = useCallback((v) => {
    const n = Number(v);
    setVolumeState(Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0);
  }, []);

  useEffect(() => {
    if (ambient === "off") return undefined;
    const ctx = getCtx();
    if (!ctx) return undefined;
    let graph = null;
    try {
      graph = buildGraph(ctx, ambient, volumeRef.current);
    } catch {
      return undefined;
    }
    graphRef.current = graph;
    return () => {
      stopGraph(graph);
      if (graphRef.current === graph) graphRef.current = null;
    };
  }, [ambient]);

  useEffect(() => {
    volumeRef.current = volume;
    const graph = graphRef.current;
    if (graph && ambientCtx) {
      try {
        graph.master.gain.setTargetAtTime(volume * graph.base, ambientCtx.currentTime, 0.05);
      } catch {}
    }
  }, [volume]);

  return { ambient, setAmbient, volume, setVolume };
}

/** Short phase-change arpeggio: "focus" ascends, "break" descends. */
export function playChime(kind) {
  const ctx = getCtx();
  if (!ctx) return;
  try {
    const freqs = kind === "break" ? [784, 659, 523] : [523, 659, 784];
    const t0 = ctx.currentTime;
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = f;
      const t = t0 + i * 0.18;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.15, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.4);
    });
  } catch {
    /* no-op on AudioContext failure */
  }
}

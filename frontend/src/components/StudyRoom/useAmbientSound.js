import { useCallback, useEffect, useRef, useState } from "react";

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
  return { sources, nodes, master, base };
}

function stopGraph(graph) {
  if (!graph) return;
  graph.sources.forEach((s) => { try { s.stop(); } catch {} });
  graph.sources.forEach((s) => { try { s.disconnect(); } catch {} });
  graph.nodes.forEach((n) => { try { n.disconnect(); } catch {} });
}

export default function useAmbientSound() {
  const [ambient, setAmbient] = useState("off"); // "off" | "rain" | "waves" | "deep"
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

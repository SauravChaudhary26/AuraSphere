import { useEffect, useState } from "react";

const RMS_THRESHOLD = 0.04;
const POLL_MS = 150;
const HOLD_MS = 400;

let sharedCtx = null;
function getSharedCtx() {
  if (!sharedCtx) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      sharedCtx = AC ? new AC() : null;
    } catch {
      sharedCtx = null;
    }
  }
  return sharedCtx;
}

/** speaking detector for a MediaStream's audio track (null-safe). */
export default function useAudioLevel(stream) {
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    const track = stream && typeof stream.getAudioTracks === "function" ? stream.getAudioTracks()[0] : null;
    if (!track) {
      setSpeaking(false);
      return undefined;
    }
    const ctx = getSharedCtx();
    if (!ctx) return undefined;
    if (ctx.state === "suspended") ctx.resume().catch(() => {}); // degrade silently pre-gesture

    let source;
    let analyser;
    try {
      source = ctx.createMediaStreamSource(new MediaStream([track]));
      analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
    } catch {
      setSpeaking(false);
      return undefined;
    }

    const data = new Uint8Array(analyser.fftSize);
    let lastLoudAt = 0;
    const id = setInterval(() => {
      analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / data.length);
      const now = Date.now();
      if (rms > RMS_THRESHOLD) lastLoudAt = now;
      setSpeaking(now - lastLoudAt < HOLD_MS); // hysteresis: hold after last loud sample
    }, POLL_MS);

    return () => {
      clearInterval(id);
      try { source.disconnect(); } catch {}
      setSpeaking(false);
    };
  }, [stream]);

  return speaking;
}

import { useEffect, useMemo, useState } from "react";
import { Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import { Badge, Button, Card, cx } from "../ui";
import AuraRing from "../ui/AuraRing";
import { randomQuote } from "./quotes";

const PHASE_META = {
  idle: { label: "Ready", badge: "neutral", color: "var(--primary-bright)" },
  focus: { label: "Focus", badge: "gold", color: "var(--primary-bright)" },
  short_break: { label: "Break", badge: "jade", color: "var(--jade)" },
  long_break: { label: "Long break", badge: "jade", color: "var(--jade)" },
};

const fmt = (ms) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

export default function TimerPanel({ timer, settings, isHost, onControl, hostName }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!timer.running || !timer.phaseEndsAt) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, [timer.running, timer.phaseEndsAt]);

  const meta = PHASE_META[timer.phase] || PHASE_META.idle;
  const isIdle = timer.phase === "idle";
  const isBreak = timer.phase === "short_break" || timer.phase === "long_break";
  const paused = !isIdle && !timer.running;

  const remainingMs = isIdle
    ? settings.focusMinutes * 60_000
    : timer.running && timer.phaseEndsAt
      ? timer.phaseEndsAt - now
      : timer.remainingMs ?? 0;
  const elapsedPct =
    !isIdle && timer.phaseDurationMs > 0
      ? Math.max(0, Math.min(100, ((timer.phaseDurationMs - remainingMs) / timer.phaseDurationMs) * 100))
      : 0;

  // Pick one quote per phase change, not per render.
  const quote = useMemo(() => (isBreak ? randomQuote() : null), [timer.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Card className="flex flex-col items-center gap-4 py-8 text-center">
      <AuraRing value={elapsedPct} size={220} thickness={16} color={meta.color}>
        <div className="mono text-[44px] font-extrabold leading-none">{fmt(remainingMs)}</div>
        <div className="mt-2">
          <Badge variant={meta.badge}>{paused ? `${meta.label} · paused` : meta.label}</Badge>
        </div>
      </AuraRing>

      <div className="flex items-center gap-2" aria-label="Cycle progress">
        {Array.from({ length: settings.cyclesBeforeLongBreak }, (_, i) => (
          <span
            key={i}
            className={cx("h-2.5 w-2.5 rounded-full", i < timer.cycleInSet ? "bg-primary" : "bg-border")}
          />
        ))}
      </div>

      <div className="text-sm text-muted">
        {timer.focusCount} session{timer.focusCount === 1 ? "" : "s"} completed
      </div>

      {isHost ? (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {isIdle && (
            <Button onClick={() => onControl("start")}>
              <Play size={16} /> Start focus
            </Button>
          )}
          {timer.running && (
            <Button variant="subtle" onClick={() => onControl("pause")}>
              <Pause size={16} /> Pause
            </Button>
          )}
          {paused && (
            <Button onClick={() => onControl("resume")}>
              <Play size={16} /> Resume
            </Button>
          )}
          {!isIdle && (
            <>
              <Button variant="subtle" onClick={() => onControl("skip")}>
                <SkipForward size={16} /> Skip
              </Button>
              <Button variant="ghost" onClick={() => onControl("reset")}>
                <RotateCcw size={16} /> Reset
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="text-sm text-muted">{hostName || "The host"} controls the timer</div>
      )}

      {quote && (
        <p className="max-w-md text-sm italic text-muted">
          “{quote.text}” — {quote.author}
        </p>
      )}
    </Card>
  );
}

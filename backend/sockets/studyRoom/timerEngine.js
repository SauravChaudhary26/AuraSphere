/**
 * Server-authoritative Pomodoro timer. All side effects (socket broadcasts,
 * aura awards) are injected so the engine is unit-testable with jest fake
 * timers and plain room objects — no socket.io, no DB.
 *
 * deps:
 *   now()                      — clock (defaults to Date.now)
 *   broadcastTimer(room)       — emit `timer:update` with room.timer
 *   systemMessage(room, text)  — store + broadcast a system chat message
 *   broadcastParticipants(room)— emit full roster (stats bumps)
 *   lobbyChanged()             — public room list changed (phase)
 *   awardPass(room)            — async aura award pass on natural focus completion
 */
function createTimerEngine(deps) {
  const {
    now = Date.now,
    broadcastTimer,
    systemMessage,
    broadcastParticipants,
    lobbyChanged,
    awardPass,
  } = deps;

  const phaseMinutes = (room, phase) =>
    phase === "focus"
      ? room.settings.focusMinutes
      : phase === "short_break"
      ? room.settings.shortBreakMinutes
      : room.settings.longBreakMinutes;

  const phaseMessage = (phase, minutes) =>
    phase === "focus"
      ? `Focus started — ${minutes} min. Lock in! 🔥`
      : phase === "short_break"
      ? `Break time — ${minutes} min ☕`
      : `Long break — ${minutes} min 🌴`;

  function clearHandle(room) {
    if (room.timerHandle) {
      clearTimeout(room.timerHandle);
      room.timerHandle = null;
    }
  }

  function schedule(room, ms) {
    room.timerHandle = setTimeout(() => {
      room.timerHandle = null;
      completePhase(room).catch((err) => {
        console.error("[studyRoom] phase completion failed:", err);
      });
    }, ms);
  }

  const bumpGen = (room) => {
    room.timerGen = (room.timerGen || 0) + 1;
  };

  // Durations are read from CURRENT settings at each phase start, so
  // settings edits apply from the next phase without touching a live one.
  function startPhase(room, phase) {
    bumpGen(room);
    const minutes = phaseMinutes(room, phase);
    const durationMs = minutes * 60 * 1000;
    const t = room.timer;
    t.phase = phase;
    t.running = true;
    t.phaseDurationMs = durationMs;
    t.phaseEndsAt = now() + durationMs;
    t.remainingMs = null;
    if (phase === "focus") {
      // Award snapshot: only users present when focus STARTS can earn aura.
      room.presentAtFocusStart = new Set(
        Array.from(room.participants.values(), (p) => String(p.userId))
      );
    }
    clearHandle(room);
    schedule(room, durationMs);
    room.lastActivityAt = now();
    systemMessage(room, phaseMessage(phase, minutes));
    broadcastTimer(room);
    lobbyChanged();
  }

  function nextPhaseAfterFocus(room) {
    if (room.timer.cycleInSet >= room.settings.cyclesBeforeLongBreak) {
      room.timer.cycleInSet = 0;
      return "long_break";
    }
    return "short_break";
  }

  async function completePhase(room) {
    if (room.deleted) return;
    const t = room.timer;
    if (t.phase === "focus") {
      t.focusCount += 1;
      t.cycleInSet += 1;
      for (const p of room.participants.values()) {
        if (room.presentAtFocusStart.has(String(p.userId))) {
          p.focusSessionsCompleted += 1;
          p.focusMinutes += room.settings.focusMinutes;
        }
      }
      systemMessage(room, "Focus session complete! ✨");
      broadcastParticipants(room);
      // Host actions (reset/pause/skip) processed while the award pass is in
      // flight bump timerGen; the stale auto-transition must then yield to
      // them instead of clobbering the timer.
      const gen = room.timerGen;
      try {
        // Award failures (DB down, missing user) must never break the
        // focus → break → focus chain.
        await awardPass(room);
      } catch (err) {
        console.error("[studyRoom] award pass failed:", err);
      }
      if (room.deleted || room.participants.size === 0 || room.timerGen !== gen) return;
      startPhase(room, nextPhaseAfterFocus(room));
    } else {
      startPhase(room, "focus");
    }
  }

  /** Host timer actions. Returns an ack-shaped result. */
  function control(room, action) {
    const t = room.timer;
    switch (action) {
      case "start":
        if (t.phase !== "idle") return { ok: false, error: "Timer is already running" };
        startPhase(room, "focus");
        break;

      case "pause":
        if (!t.running || t.phase === "idle") return { ok: false, error: "Nothing to pause" };
        bumpGen(room);
        clearHandle(room);
        t.remainingMs = Math.max(0, t.phaseEndsAt - now());
        t.phaseEndsAt = null;
        t.running = false;
        broadcastTimer(room);
        break;

      case "resume":
        if (t.phase === "idle" || t.running || t.remainingMs == null) {
          return { ok: false, error: "Nothing to resume" };
        }
        bumpGen(room);
        t.phaseEndsAt = now() + t.remainingMs;
        schedule(room, t.remainingMs);
        t.remainingMs = null;
        t.running = true;
        broadcastTimer(room);
        break;

      case "skip":
        if (t.phase === "idle") return { ok: false, error: "Timer is not running" };
        clearHandle(room);
        // Skipped focus earns no award and bumps no counters.
        startPhase(room, t.phase === "focus" ? nextPhaseAfterFocus(room) : "focus");
        break;

      case "reset":
        bumpGen(room);
        clearHandle(room);
        t.phase = "idle";
        t.running = false;
        t.phaseEndsAt = null;
        t.phaseDurationMs = 0;
        t.remainingMs = null;
        t.cycleInSet = 0; // focusCount stats survive a reset
        broadcastTimer(room);
        lobbyChanged();
        break;

      default:
        return { ok: false, error: "Unknown timer action" };
    }
    room.lastActivityAt = now();
    return { ok: true, timer: room.timer };
  }

  return { control, clearHandle };
}

module.exports = { createTimerEngine };

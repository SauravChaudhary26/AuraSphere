jest.mock('../services/pointsService', () => ({ awardPoints: jest.fn() }));
jest.mock('../models/AuraTransaction', () => ({ countDocuments: jest.fn() }));
jest.mock('../models/User', () => ({ findById: jest.fn() }));

const { awardPoints } = require('../services/pointsService');
const AuraTransaction = require('../models/AuraTransaction');
const { config } = require('../config');
const store = require('../sockets/studyRoom/roomStore');
const { sanitizeSettings } = require('../sockets/studyRoom/validate');
const { createTimerEngine } = require('../sockets/studyRoom/timerEngine');
const { runAwardPass } = require('../sockets/studyRoom/awards');

const MIN = 60 * 1000;

const makeDeps = (overrides = {}) => ({
  broadcastTimer: jest.fn(),
  systemMessage: jest.fn(),
  broadcastParticipants: jest.fn(),
  lobbyChanged: jest.fn(),
  awardPass: jest.fn().mockResolvedValue(undefined),
  ...overrides,
});

const makeRoom = (settingsOverrides = {}, userIds = ['u1', 'u2']) => {
  const room = store.createRoom('sock-u1', sanitizeSettings(settingsOverrides));
  userIds.forEach((userId, i) => {
    store.addParticipant(
      room,
      store.makeParticipant({
        socketId: `sock-${userId}`,
        userId,
        name: `User ${userId}`,
        isHost: i === 0,
        now: 1000 + i,
      })
    );
  });
  return room;
};

describe('Study Room Timer Engine', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    store.resetForTests();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('start begins a focus phase and natural completion chains into a short break, then focus', async () => {
    const deps = makeDeps();
    const engine = createTimerEngine(deps);
    const room = makeRoom({ focusMinutes: 25, shortBreakMinutes: 5 });

    const res = engine.control(room, 'start');
    expect(res).toEqual({ ok: true, timer: room.timer });
    expect(room.timer).toMatchObject({ phase: 'focus', running: true, phaseDurationMs: 25 * MIN });
    expect(room.timer.phaseEndsAt).toBe(Date.now() + 25 * MIN);
    expect(room.presentAtFocusStart).toEqual(new Set(['u1', 'u2']));
    expect(deps.systemMessage).toHaveBeenCalledWith(room, 'Focus started — 25 min. Lock in! 🔥');

    await jest.advanceTimersByTimeAsync(25 * MIN);
    expect(room.timer).toMatchObject({ phase: 'short_break', running: true, focusCount: 1, cycleInSet: 1 });
    expect(deps.systemMessage).toHaveBeenCalledWith(room, 'Focus session complete! ✨');
    expect(deps.systemMessage).toHaveBeenCalledWith(room, 'Break time — 5 min ☕');
    expect(room.participants.get('sock-u1')).toMatchObject({ focusSessionsCompleted: 1, focusMinutes: 25 });

    await jest.advanceTimersByTimeAsync(5 * MIN);
    expect(room.timer.phase).toBe('focus');
  });

  it('takes a long break after cyclesBeforeLongBreak focus sessions and resets cycleInSet', async () => {
    const deps = makeDeps();
    const engine = createTimerEngine(deps);
    const room = makeRoom({ focusMinutes: 10, shortBreakMinutes: 5, longBreakMinutes: 20, cyclesBeforeLongBreak: 2 });

    engine.control(room, 'start');
    await jest.advanceTimersByTimeAsync(10 * MIN); // focus 1 done → short break
    expect(room.timer.phase).toBe('short_break');
    await jest.advanceTimersByTimeAsync(5 * MIN); // → focus 2
    await jest.advanceTimersByTimeAsync(10 * MIN); // focus 2 done → long break

    expect(room.timer).toMatchObject({ phase: 'long_break', cycleInSet: 0, focusCount: 2, phaseDurationMs: 20 * MIN });
    expect(deps.systemMessage).toHaveBeenCalledWith(room, 'Long break — 20 min 🌴');
    await jest.advanceTimersByTimeAsync(20 * MIN);
    expect(room.timer.phase).toBe('focus');
  });

  it('pause freezes remainingMs and resume restores the countdown', async () => {
    const deps = makeDeps();
    const engine = createTimerEngine(deps);
    const room = makeRoom({ focusMinutes: 25 });

    engine.control(room, 'start');
    await jest.advanceTimersByTimeAsync(MIN);
    expect(engine.control(room, 'pause').ok).toBe(true);
    expect(room.timer).toMatchObject({ running: false, phaseEndsAt: null, remainingMs: 24 * MIN });

    // Nothing fires while paused.
    await jest.advanceTimersByTimeAsync(60 * MIN);
    expect(room.timer.phase).toBe('focus');
    expect(room.timer.focusCount).toBe(0);

    expect(engine.control(room, 'resume').ok).toBe(true);
    expect(room.timer).toMatchObject({ running: true, remainingMs: null, phaseEndsAt: Date.now() + 24 * MIN });

    await jest.advanceTimersByTimeAsync(24 * MIN);
    expect(room.timer.phase).toBe('short_break');
    expect(room.timer.focusCount).toBe(1);
  });

  it('skipping a focus phase awards nothing and bumps no counters', async () => {
    const deps = makeDeps();
    const engine = createTimerEngine(deps);
    const room = makeRoom();

    engine.control(room, 'start');
    expect(engine.control(room, 'skip').ok).toBe(true);

    expect(room.timer).toMatchObject({ phase: 'short_break', running: true, focusCount: 0, cycleInSet: 0 });
    expect(deps.awardPass).not.toHaveBeenCalled();
    expect(room.participants.get('sock-u1').focusSessionsCompleted).toBe(0);
  });

  it('reset returns to idle, keeps focusCount, and rejects invalid transitions', async () => {
    const deps = makeDeps();
    const engine = createTimerEngine(deps);
    const room = makeRoom({ focusMinutes: 5 });

    expect(engine.control(room, 'pause').ok).toBe(false);
    engine.control(room, 'start');
    expect(engine.control(room, 'start').ok).toBe(false);
    await jest.advanceTimersByTimeAsync(5 * MIN);
    expect(room.timer.focusCount).toBe(1);

    expect(engine.control(room, 'reset').ok).toBe(true);
    expect(room.timer).toMatchObject({
      phase: 'idle',
      running: false,
      phaseEndsAt: null,
      remainingMs: null,
      cycleInSet: 0,
      focusCount: 1,
    });
    await jest.advanceTimersByTimeAsync(60 * MIN);
    expect(room.timer.phase).toBe('idle');
  });

  describe('award pass', () => {
    const wireRealAwardPass = (emitToUser, notifyCapReached) =>
      makeDeps({ awardPass: (room) => runAwardPass(room, { emitToUser, notifyCapReached }) });

    it('awards only users present at focus start AND still in the room', async () => {
      AuraTransaction.countDocuments.mockResolvedValue(0);
      awardPoints.mockResolvedValue(120);
      const emitToUser = jest.fn();
      const notifyCapReached = jest.fn();
      const engine = createTimerEngine(wireRealAwardPass(emitToUser, notifyCapReached));
      const room = makeRoom({ focusMinutes: 25 }, ['u1', 'u2']);

      engine.control(room, 'start');
      // u3 joins mid-focus (not in snapshot); u2 leaves before completion.
      store.addParticipant(room, store.makeParticipant({ socketId: 'sock-u3', userId: 'u3' }));
      store.removeParticipant(room, 'sock-u2');

      await jest.advanceTimersByTimeAsync(25 * MIN);

      expect(awardPoints).toHaveBeenCalledTimes(1);
      expect(awardPoints).toHaveBeenCalledWith('u1', config.points.studySessionCompleted, 'study_session_completed');
      expect(emitToUser).toHaveBeenCalledWith('u1', 'aura:awarded', {
        amount: config.points.studySessionCompleted,
        newBalance: 120,
        reason: 'study_session_completed',
      });
      expect(notifyCapReached).not.toHaveBeenCalled();
    });

    it('skips users at the daily cap and notifies them instead', async () => {
      AuraTransaction.countDocuments.mockResolvedValue(8);
      const emitToUser = jest.fn();
      const notifyCapReached = jest.fn();
      const engine = createTimerEngine(wireRealAwardPass(emitToUser, notifyCapReached));
      const room = makeRoom({ focusMinutes: 25 }, ['u1']);

      engine.control(room, 'start');
      await jest.advanceTimersByTimeAsync(25 * MIN);

      expect(awardPoints).not.toHaveBeenCalled();
      expect(notifyCapReached).toHaveBeenCalledWith('u1');
      // Stats still count even when capped.
      expect(room.participants.get('sock-u1').focusSessionsCompleted).toBe(1);
    });

    it('host actions during the award pass win over the stale auto-transition', async () => {
      // Award pass hangs until we release it — the realistic Render→Atlas window.
      let releaseAward;
      const awardPass = jest.fn(
        () => new Promise((resolve) => { releaseAward = resolve; })
      );
      const deps = makeDeps({ awardPass });
      const engine = createTimerEngine(deps);
      const room = makeRoom({ focusMinutes: 25 }, ['u1']);

      engine.control(room, 'start');
      await jest.advanceTimersByTimeAsync(25 * MIN); // completion fires, award pass pending
      expect(awardPass).toHaveBeenCalledTimes(1);
      expect(room.timer.focusCount).toBe(1);

      // Host resets while the award pass is still in flight...
      expect(engine.control(room, 'reset').ok).toBe(true);
      expect(room.timer.phase).toBe('idle');

      // ...so the resolving completion must NOT restart the timer.
      releaseAward();
      await jest.advanceTimersByTimeAsync(0);
      expect(room.timer).toMatchObject({ phase: 'idle', running: false });
      await jest.advanceTimersByTimeAsync(60 * MIN);
      expect(room.timer.phase).toBe('idle');
    });

    it('a DB failure during awards never stops the phase chain', async () => {
      AuraTransaction.countDocuments.mockRejectedValue(new Error('db down'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const engine = createTimerEngine(wireRealAwardPass(jest.fn(), jest.fn()));
      const room = makeRoom({ focusMinutes: 25, shortBreakMinutes: 5 }, ['u1']);

      engine.control(room, 'start');
      await jest.advanceTimersByTimeAsync(25 * MIN);

      expect(room.timer).toMatchObject({ phase: 'short_break', running: true, focusCount: 1 });
      await jest.advanceTimersByTimeAsync(5 * MIN);
      expect(room.timer.phase).toBe('focus');
      consoleSpy.mockRestore();
    });
  });
});

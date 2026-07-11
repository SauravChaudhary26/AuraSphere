const store = require("../sockets/studyRoom/roomStore");
const { sanitizeSettings, sanitizeGoals } = require("../sockets/studyRoom/validate");
const { CODE_ALPHABET, DEFAULT_SETTINGS } = require("../sockets/studyRoom/constants");

const makeRoom = (overrides = {}, hostSocketId = "sock-host") =>
  store.createRoom(hostSocketId, sanitizeSettings(overrides));

const joinAs = (room, socketId, userId, now = Date.now()) => {
  const participant = store.makeParticipant({
    socketId,
    userId,
    name: `User ${userId}`,
    avatar: null,
    now,
  });
  store.addParticipant(room, participant);
  return participant;
};

describe('Study Room Store', () => {
  afterEach(() => {
    store.resetForTests();
  });

  describe('room creation', () => {
    it('generates a 6-char code from the unambiguous alphabet and registers the room', () => {
      const room = makeRoom();
      expect(room.id).toMatch(new RegExp(`^[${CODE_ALPHABET}]{6}$`));
      expect(store.getRoom(room.id)).toBe(room);
      expect(room.timer).toEqual({
        phase: 'idle',
        running: false,
        phaseEndsAt: null,
        phaseDurationMs: 0,
        remainingMs: null,
        focusCount: 0,
        cycleInSet: 0,
      });
    });

    it('clamps and defaults settings from untrusted payloads', () => {
      const settings = sanitizeSettings({
        name: 'ab', // too short → default
        emoji: '💀', // not in ROOM_EMOJIS → default
        maxParticipants: 99,
        focusMinutes: 1,
        shortBreakMinutes: 500,
        cyclesBeforeLongBreak: 'nope',
        chatEnabled: 0,
      });
      expect(settings.name).toBe(DEFAULT_SETTINGS.name);
      expect(settings.emoji).toBe(DEFAULT_SETTINGS.emoji);
      expect(settings.maxParticipants).toBe(12);
      expect(settings.focusMinutes).toBe(5);
      expect(settings.shortBreakMinutes).toBe(30);
      expect(settings.cyclesBeforeLongBreak).toBe(DEFAULT_SETTINGS.cyclesBeforeLongBreak);
      expect(settings.chatEnabled).toBe(false);
    });
  });

  describe('joining', () => {
    it('rejects joins beyond maxParticipants', () => {
      const room = makeRoom({ maxParticipants: 2 });
      joinAs(room, 'sock-host', 'u1');
      joinAs(room, 'sock-2', 'u2');
      expect(store.canJoin(room, 'u3')).toBe('Room is full');
    });

    it('finds an existing participant by userId for the duplicate/takeover decision', () => {
      const room = makeRoom();
      const p = joinAs(room, 'sock-host', 'u1');
      expect(store.findParticipantByUserId(room, 'u1')).toBe(p);
      expect(store.findParticipantByUserId(room, 'u2')).toBeNull();
      // canJoin itself no longer rejects duplicates — the handler decides
      // between rejection (old socket alive) and takeover (stale entry).
      expect(store.canJoin(room, 'u1')).toBeNull();
    });

    it('takeoverParticipant re-seats a reconnecting user, preserving stats and host role', () => {
      const room = makeRoom({}, 'sock-old');
      const p = joinAs(room, 'sock-old', 'u1', 1000);
      p.isHost = true;
      room.hostSocketId = 'sock-old';
      p.goals = [{ id: 'g-1', text: 'finish ch. 4', done: true }];
      p.focusSessionsCompleted = 2;
      p.focusMinutes = 50;
      p.videoOn = true;

      const moved = store.takeoverParticipant(room, 'sock-old', 'sock-new');

      expect(moved).toBe(p);
      expect(room.participants.has('sock-old')).toBe(false);
      expect(room.participants.get('sock-new')).toBe(p);
      expect(p.socketId).toBe('sock-new');
      expect(p.joinedAt).toBe(1000); // succession order survives
      expect(p.focusSessionsCompleted).toBe(2);
      expect(p.goals).toHaveLength(1);
      expect(room.hostSocketId).toBe('sock-new');
      expect(store.takeoverParticipant(room, 'sock-gone', 'sock-x')).toBeNull();
    });

    it('counts live rooms created by a user', () => {
      makeRoom();
      const mine1 = store.createRoom('s1', sanitizeSettings({}), 'u9');
      store.createRoom('s2', sanitizeSettings({}), 'u9');
      expect(store.roomsCreatedBy('u9')).toBe(2);
      store.deleteRoom(mine1.id);
      expect(store.roomsCreatedBy('u9')).toBe(1);
    });

    it('blocks rejoin after a kick', () => {
      const room = makeRoom();
      joinAs(room, 'sock-host', 'u1');
      joinAs(room, 'sock-2', 'u2');
      room.kickedUserIds.add('u2');
      store.removeParticipant(room, 'sock-2');
      expect(store.canJoin(room, 'u2')).toBe('You were removed from this room');
    });
  });

  describe('host succession', () => {
    it('promotes the earliest-joined remaining participant', () => {
      const room = makeRoom();
      joinAs(room, 'sock-host', 'u1', 1000);
      const second = joinAs(room, 'sock-2', 'u2', 2000);
      joinAs(room, 'sock-3', 'u3', 3000);

      store.removeParticipant(room, 'sock-host');
      const newHost = store.promoteHost(room);

      expect(newHost).toBe(second);
      expect(newHost.isHost).toBe(true);
      expect(room.hostSocketId).toBe('sock-2');
      expect(room.participants.get('sock-3').isHost).toBe(false);
    });
  });

  describe('deletion and gc', () => {
    it('deleteRoom clears the timer handle, empties participants, and removes the room', () => {
      const room = makeRoom();
      joinAs(room, 'sock-host', 'u1');
      room.timerHandle = setTimeout(() => {}, 60000);
      store.deleteRoom(room.id);
      expect(store.getRoom(room.id)).toBeNull();
      expect(room.timerHandle).toBeNull();
      expect(room.deleted).toBe(true);
      // Orphaned references must not look like live rooms to in-flight joins.
      expect(room.participants.size).toBe(0);
    });

    it('sweep deletes empty rooms and stale idle occupied rooms', () => {
      const empty = makeRoom();
      const stale = makeRoom({}, 'sock-a');
      const occupant = joinAs(stale, 'sock-a', 'u1');
      stale.lastActivityAt = Date.now() - 3 * 60 * 60 * 1000;
      const active = makeRoom({}, 'sock-b');
      joinAs(active, 'sock-b', 'u2');

      const { closedRooms, changed } = store.sweep();

      expect(changed).toBe(true);
      // Snapshots survive deleteRoom clearing the room's own participant map.
      expect(closedRooms).toEqual([{ id: stale.id, participants: [occupant] }]);
      expect(store.getRoom(empty.id)).toBeNull();
      expect(store.getRoom(stale.id)).toBeNull();
      expect(store.getRoom(active.id)).toBe(active);
    });
  });

  describe('serialization', () => {
    it('lists only public rooms with the PublicRoomSummary shape', () => {
      const pub = makeRoom({ name: 'Open Study', maxParticipants: 4 }, 'sock-a');
      joinAs(pub, 'sock-a', 'u1');
      const priv = makeRoom({ name: 'Secret Den', isPrivate: true }, 'sock-b');
      joinAs(priv, 'sock-b', 'u2');

      const summaries = store.publicRoomSummaries();
      expect(summaries).toEqual([
        {
          id: pub.id,
          name: 'Open Study',
          emoji: '📚',
          participantCount: 1,
          maxParticipants: 4,
          phase: 'idle',
          focusMinutes: 25,
          hostName: 'User u1',
        },
      ]);
    });

    it('caps chat history at 200 and the join ack slice at 50', () => {
      const room = makeRoom();
      const me = joinAs(room, 'sock-host', 'u1');
      for (let i = 0; i < 230; i++) {
        store.addChatMessage(room, store.makeUserMessage(me, `msg ${i}`));
      }
      expect(room.chat).toHaveLength(200);
      const state = store.serializeState(room, 'sock-host');
      expect(state.chat).toHaveLength(50);
      expect(state.chat[49].text).toBe('msg 229');
      expect(state.mySocketId).toBe('sock-host');
      expect(state.room).toMatchObject({ id: room.id, name: 'Study Room', emoji: '📚' });
    });
  });

  describe('goals validation', () => {
    it('sanitizes a goals payload (cap 5, strip junk, coerce done)', () => {
      expect(sanitizeGoals('nope')).toBeNull();
      const goals = sanitizeGoals([
        { id: 'g-1', text: '  read ch. 4  ', done: 1, extra: 'strip me' },
        { id: 'g-2', text: '' }, // empty text dropped
        'garbage',
        { text: 'no id' },
        ...Array.from({ length: 6 }, (_, i) => ({ id: `g-${i + 3}`, text: `t${i}` })),
      ]);
      expect(goals).toHaveLength(5);
      expect(goals[0]).toEqual({ id: 'g-1', text: 'read ch. 4', done: true });
    });
  });
});

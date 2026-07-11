const {
  CODE_ALPHABET,
  CODE_LENGTH,
  CHAT_HISTORY_MAX,
  CHAT_JOIN_SLICE,
  GC_IDLE_MAX_MS,
} = require("./constants");

/**
 * In-memory room state, correct for a single backend instance (current Render
 * deployment). To scale horizontally, add the socket.io Redis adapter and move
 * this Map into Redis — all socket/DB side-effects live in index.js, so the
 * store itself stays a pure, unit-testable data layer.
 */

// code -> room
const rooms = new Map();

let seq = 0;
const nextId = (prefix) => `${prefix}-${Date.now().toString(36)}-${(seq++).toString(36)}`;

function generateCode() {
  for (;;) {
    let code = "";
    for (let i = 0; i < CODE_LENGTH; i++) {
      code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
    }
    if (!rooms.has(code)) return code;
  }
}

const defaultTimer = () => ({
  phase: "idle",
  running: false,
  phaseEndsAt: null,
  phaseDurationMs: 0,
  remainingMs: null,
  focusCount: 0,
  cycleInSet: 0,
});

function createRoom(hostSocketId, settings, createdByUserId = null, now = Date.now()) {
  const room = {
    id: generateCode(),
    createdAt: now,
    createdByUserId: createdByUserId == null ? null : String(createdByUserId),
    hostSocketId,
    settings,
    timer: defaultTimer(),
    timerGen: 0, // bumped by every timer mutation; guards the async award window
    participants: new Map(), // socketId -> Participant
    chat: [],
    kickedUserIds: new Set(),
    presentAtFocusStart: new Set(), // userIds snapshotted when a focus phase starts
    timerHandle: null,
    lastActivityAt: now,
    deleted: false,
  };
  rooms.set(room.id, room);
  return room;
}

const getRoom = (code) => rooms.get(code) || null;
const roomCount = () => rooms.size;

/** How many live rooms this user created — bounds per-user room hoarding. */
function roomsCreatedBy(userId) {
  const uid = String(userId);
  let n = 0;
  for (const room of rooms.values()) {
    if (room.createdByUserId === uid) n += 1;
  }
  return n;
}

function deleteRoom(code) {
  const room = rooms.get(code);
  if (!room) return;
  if (room.timerHandle) {
    clearTimeout(room.timerHandle);
    room.timerHandle = null;
  }
  room.deleted = true; // lets an in-flight timer completion bail out safely
  rooms.delete(code);
  // Orphaned room objects must not masquerade as live rooms (a join handler
  // may still hold a reference across an await).
  room.participants.clear();
}

/** Returns a human-readable rejection reason, or null when joining is allowed. */
function canJoin(room, userId) {
  const uid = String(userId);
  if (room.kickedUserIds.has(uid)) return "You were removed from this room";
  if (room.participants.size >= room.settings.maxParticipants) return "Room is full";
  return null;
}

const findParticipantByUserId = (room, userId) => {
  const uid = String(userId);
  for (const p of room.participants.values()) {
    if (String(p.userId) === uid) return p;
  }
  return null;
};

/**
 * Re-seat an existing participant on a new socket (reconnect takeover):
 * stats, goals, media flags, joinedAt and host role all survive the blip.
 */
function takeoverParticipant(room, oldSocketId, newSocketId, now = Date.now()) {
  const p = room.participants.get(oldSocketId);
  if (!p) return null;
  room.participants.delete(oldSocketId);
  p.socketId = newSocketId;
  room.participants.set(newSocketId, p);
  if (room.hostSocketId === oldSocketId) room.hostSocketId = newSocketId;
  room.lastActivityAt = now;
  return p;
}

function makeParticipant({ socketId, userId, name, avatar, isHost = false, now = Date.now() }) {
  return {
    socketId,
    userId: String(userId),
    name: name || "Student",
    avatar: avatar || null,
    isHost,
    joinedAt: now,
    videoOn: false,
    audioOn: false,
    goals: [],
    focusSessionsCompleted: 0,
    focusMinutes: 0,
  };
}

function addParticipant(room, participant, now = Date.now()) {
  room.participants.set(participant.socketId, participant);
  room.lastActivityAt = now;
}

function removeParticipant(room, socketId) {
  const participant = room.participants.get(socketId) || null;
  if (participant) room.participants.delete(socketId);
  return participant;
}

/** Promote the earliest-joined remaining participant to host. */
function promoteHost(room) {
  let next = null;
  for (const p of room.participants.values()) {
    if (!next || p.joinedAt < next.joinedAt) next = p;
  }
  if (!next) return null;
  for (const p of room.participants.values()) p.isHost = p === next;
  room.hostSocketId = next.socketId;
  return next;
}

const makeSystemMessage = (text) => ({ id: nextId("m"), kind: "system", text, ts: Date.now() });

const makeUserMessage = (participant, text) => ({
  id: nextId("m"),
  kind: "user",
  userId: participant.userId,
  name: participant.name,
  avatar: participant.avatar,
  text,
  ts: Date.now(),
});

const makeReactionId = () => nextId("r");

function addChatMessage(room, message) {
  room.chat.push(message);
  if (room.chat.length > CHAT_HISTORY_MAX) {
    room.chat.splice(0, room.chat.length - CHAT_HISTORY_MAX);
  }
}

const serializeParticipant = (p) => ({
  socketId: p.socketId,
  userId: p.userId,
  name: p.name,
  avatar: p.avatar,
  isHost: p.isHost,
  joinedAt: p.joinedAt,
  videoOn: p.videoOn,
  audioOn: p.audioOn,
  goals: p.goals,
  focusSessionsCompleted: p.focusSessionsCompleted,
  focusMinutes: p.focusMinutes,
});

const participantsPayload = (room) => ({
  participants: Array.from(room.participants.values(), serializeParticipant),
  hostSocketId: room.hostSocketId,
});

const serializeRoom = (room) => ({
  id: room.id,
  name: room.settings.name,
  emoji: room.settings.emoji,
  createdAt: room.createdAt,
  hostSocketId: room.hostSocketId,
  settings: { ...room.settings },
});

const serializeState = (room, mySocketId) => ({
  room: serializeRoom(room),
  mySocketId,
  participants: Array.from(room.participants.values(), serializeParticipant),
  timer: { ...room.timer },
  chat: room.chat.slice(-CHAT_JOIN_SLICE),
});

function publicRoomSummaries() {
  const out = [];
  for (const room of rooms.values()) {
    if (room.settings.isPrivate) continue;
    out.push({
      id: room.id,
      name: room.settings.name,
      emoji: room.settings.emoji,
      participantCount: room.participants.size,
      maxParticipants: room.settings.maxParticipants,
      phase: room.timer.phase,
      focusMinutes: room.settings.focusMinutes,
      hostName: room.participants.get(room.hostSocketId)?.name || "Student",
    });
  }
  return out;
}

/**
 * GC pass: delete empty rooms, plus occupied rooms that sat idle (timer never
 * started / reset) for over 2h. Returns the still-occupied rooms that were
 * removed so the caller can notify their members, and whether anything changed.
 */
function sweep(now = Date.now()) {
  const closedRooms = [];
  let changed = false;
  for (const [code, room] of rooms) {
    if (room.participants.size === 0) {
      deleteRoom(code);
      changed = true;
      continue;
    }
    const idle = room.timer.phase === "idle" && !room.timer.running;
    if (idle && now - room.lastActivityAt > GC_IDLE_MAX_MS) {
      // Snapshot occupants before deleteRoom clears them, so the caller can
      // still notify and detach every member.
      closedRooms.push({ id: room.id, participants: Array.from(room.participants.values()) });
      deleteRoom(code);
      changed = true;
    }
  }
  return { closedRooms, changed };
}

function resetForTests() {
  for (const code of Array.from(rooms.keys())) deleteRoom(code);
}

module.exports = {
  createRoom,
  getRoom,
  roomCount,
  roomsCreatedBy,
  deleteRoom,
  canJoin,
  findParticipantByUserId,
  takeoverParticipant,
  makeParticipant,
  addParticipant,
  removeParticipant,
  promoteHost,
  makeSystemMessage,
  makeUserMessage,
  makeReactionId,
  addChatMessage,
  participantsPayload,
  serializeState,
  publicRoomSummaries,
  sweep,
  resetForTests,
};

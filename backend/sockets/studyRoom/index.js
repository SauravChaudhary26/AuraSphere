const { verifyToken } = require("../../utils/token");
const User = require("../../models/User");
const store = require("./roomStore");
const { createTimerEngine } = require("./timerEngine");
const { runAwardPass } = require("./awards");
const {
  sanitizeSettings,
  sanitizeChatText,
  sanitizeCode,
  sanitizeGoals,
  isValidReaction,
} = require("./validate");
const {
  MAX_ROOMS,
  MAX_ROOMS_PER_USER,
  CHAT_MIN_INTERVAL_MS,
  REACTION_WINDOW_MS,
  REACTION_MAX_IN_WINDOW,
  STATE_MIN_INTERVAL_MS,
  RTC_MAX_PAYLOAD_BYTES,
  RTC_WINDOW_MS,
  RTC_MAX_IN_WINDOW,
  JOIN_FAIL_THRESHOLD,
  JOIN_FAIL_COOLDOWN_MS,
  GC_INTERVAL_MS,
  LOBBY_CHANNEL,
} = require("./constants");

const TIMER_ACTIONS = ["start", "pause", "resume", "skip", "reset"];

/** Collaborative Pomodoro study rooms — realtime layer entry point. */
function registerStudyRoomHandlers(io) {
  const broadcastLobby = () =>
    io.to(LOBBY_CHANNEL).emit("lobby:rooms", { rooms: store.publicRoomSummaries() });

  const broadcastParticipants = (room) =>
    io.to(room.id).emit("room:participants", store.participantsPayload(room));

  const sendSystem = (room, text) => {
    const message = store.makeSystemMessage(text);
    store.addChatMessage(room, message);
    io.to(room.id).emit("chat:message", message);
  };

  const socketsOfUser = (room, userId) => {
    const out = [];
    for (const p of room.participants.values()) {
      if (String(p.userId) === String(userId)) out.push(p.socketId);
    }
    return out;
  };

  const engine = createTimerEngine({
    broadcastTimer: (room) => io.to(room.id).emit("timer:update", room.timer),
    systemMessage: sendSystem,
    broadcastParticipants,
    lobbyChanged: broadcastLobby,
    awardPass: (room) =>
      runAwardPass(room, {
        emitToUser: (userId, event, payload) => {
          for (const sid of socketsOfUser(room, userId)) io.to(sid).emit(event, payload);
        },
        notifyCapReached: (userId) => {
          const message = store.makeSystemMessage(
            "Daily study aura cap reached — sessions still count toward your stats!"
          );
          for (const sid of socketsOfUser(room, userId)) io.to(sid).emit("chat:message", message);
        },
      }),
  });

  async function fetchProfile(userId) {
    try {
      const user = await User.findById(userId).select("name avatar");
      return { name: user?.name || "Student", avatar: user?.avatar || null };
    } catch {
      return { name: "Student", avatar: null };
    }
  }

  const getMyRoom = (socket) => (socket.data.roomId ? store.getRoom(socket.data.roomId) : null);

  function leaveCurrentRoom(socket) {
    const code = socket.data.roomId;
    if (!code) return;
    socket.data.roomId = null;
    socket.leave(code);
    const room = store.getRoom(code);
    if (!room) return;
    const removed = store.removeParticipant(room, socket.id);
    if (!removed) return;
    socket.to(code).emit("rtc:peer-left", { socketId: socket.id });
    if (room.participants.size === 0) {
      store.deleteRoom(code);
    } else {
      sendSystem(room, `${removed.name} left the room`);
      if (removed.isHost) {
        const newHost = store.promoteHost(room);
        if (newHost) sendSystem(room, `${newHost.name} is now the host`);
      }
      broadcastParticipants(room);
    }
    broadcastLobby();
  }

  function detachSocketFromRoom(socketId, code) {
    const s = io.sockets.sockets.get(socketId);
    if (s) {
      s.data.roomId = null;
      s.leave(code);
    }
  }

  // Every handler is wrapped: a thrown error acks a generic failure instead
  // of crashing the process, and acks are only sent when the client asked.
  const withAck = (handler) => (payload, cb) => {
    const ack = typeof cb === "function" ? cb : () => {};
    Promise.resolve()
      .then(() => handler(payload && typeof payload === "object" ? payload : {}, ack))
      .catch((err) => {
        console.error("[studyRoom] handler error:", err);
        try {
          ack({ ok: false, error: "Something went wrong" });
        } catch (_) {
          /* ack already consumed */
        }
      });
  };

  // Authenticate every socket from its handshake token — never trust a
  // client-supplied identity.
  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error("Authentication required"));
    try {
      const decoded = verifyToken(token);
      socket.data.userId = decoded._id;
      socket.data.email = decoded.email;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    socket.on(
      "room:create",
      withAck(async (payload, ack) => {
        if (store.roomCount() >= MAX_ROOMS) {
          return ack({ ok: false, error: "Server is at capacity — try again later" });
        }
        if (store.roomsCreatedBy(socket.data.userId) >= MAX_ROOMS_PER_USER) {
          return ack({ ok: false, error: "You already host several rooms — close one first" });
        }
        leaveCurrentRoom(socket);
        const settings = sanitizeSettings(payload);
        const profile = await fetchProfile(socket.data.userId);
        // Both caps re-checked after the await — parallel creates raced past
        // the first check while the profile fetch was in flight.
        if (
          store.roomCount() >= MAX_ROOMS ||
          store.roomsCreatedBy(socket.data.userId) >= MAX_ROOMS_PER_USER
        ) {
          return ack({ ok: false, error: "Server is at capacity — try again later" });
        }
        const room = store.createRoom(socket.id, settings, socket.data.userId);
        store.addParticipant(
          room,
          store.makeParticipant({
            socketId: socket.id,
            userId: socket.data.userId,
            ...profile,
            isHost: true,
          })
        );
        socket.join(room.id);
        socket.data.roomId = room.id;
        broadcastLobby();
        ack({ ok: true, state: store.serializeState(room, socket.id) });
      })
    );

    socket.on(
      "room:join",
      withAck(async (payload, ack) => {
        // Metered failures keep private codes un-bruteforceable.
        const attemptAt = Date.now();
        if (
          (socket.data.joinFails || 0) >= JOIN_FAIL_THRESHOLD &&
          attemptAt - (socket.data.lastJoinFailAt || 0) < JOIN_FAIL_COOLDOWN_MS
        ) {
          return ack({ ok: false, error: "Too many attempts — wait a few seconds" });
        }
        const code = sanitizeCode(payload.code);
        const room = store.getRoom(code);
        if (!room) {
          socket.data.joinFails = (socket.data.joinFails || 0) + 1;
          socket.data.lastJoinFailAt = attemptAt;
          return ack({ ok: false, error: "Room not found" });
        }
        socket.data.joinFails = 0;
        // Reconnect resilience: already a member → just return current state.
        if (socket.data.roomId === code && room.participants.has(socket.id)) {
          return ack({ ok: true, state: store.serializeState(room, socket.id) });
        }
        if (socket.data.roomId) leaveCurrentRoom(socket);
        const profile = await fetchProfile(socket.data.userId);
        // The room may have been ended/GC'd while the profile fetch was in
        // flight — joining an orphaned room object would ack ok into a ghost.
        if (room.deleted || store.getRoom(code) !== room) {
          return ack({ ok: false, error: "Room not found" });
        }
        const existing = store.findParticipantByUserId(room, socket.data.userId);
        if (existing && existing.socketId !== socket.id) {
          // Same user on a new connection — a reconnect after a network drop
          // or a second tab. A zombie socket still reports connected until the
          // ping timeout (~45s), so liveness can't be probed reliably; the
          // NEWEST connection simply wins the seat. Stats, goals and host role
          // move with it; the old socket (if any) is told to stand down.
          const oldId = existing.socketId;
          const oldSocket = io.sockets.sockets.get(oldId);
          store.takeoverParticipant(room, oldId, socket.id);
          if (oldSocket) {
            oldSocket.emit("room:session-replaced", {});
            detachSocketFromRoom(oldId, room.id);
            oldSocket.disconnect(true);
          }
          socket.join(room.id);
          socket.data.roomId = room.id;
          socket.to(room.id).emit("rtc:peer-left", { socketId: oldId });
          broadcastParticipants(room);
          return ack({ ok: true, state: store.serializeState(room, socket.id) });
        }
        const rejection = store.canJoin(room, socket.data.userId);
        if (rejection) return ack({ ok: false, error: rejection });
        const participant = store.makeParticipant({
          socketId: socket.id,
          userId: socket.data.userId,
          ...profile,
        });
        store.addParticipant(room, participant);
        socket.join(room.id);
        socket.data.roomId = room.id;
        sendSystem(room, `${participant.name} joined the room`);
        broadcastParticipants(room);
        broadcastLobby();
        ack({ ok: true, state: store.serializeState(room, socket.id) });
      })
    );

    socket.on(
      "room:leave",
      withAck((payload, ack) => {
        leaveCurrentRoom(socket); // idempotent
        ack({ ok: true });
      })
    );

    socket.on(
      "room:end",
      withAck((payload, ack) => {
        const room = getMyRoom(socket);
        if (!room) return ack({ ok: false, error: "You're not in a room" });
        if (room.hostSocketId !== socket.id) {
          return ack({ ok: false, error: "Only the host can do that" });
        }
        io.to(room.id).emit("room:closed", { reason: "ended_by_host" });
        for (const p of room.participants.values()) detachSocketFromRoom(p.socketId, room.id);
        store.deleteRoom(room.id);
        broadcastLobby();
        ack({ ok: true });
      })
    );

    socket.on(
      "room:settings:update",
      withAck((payload, ack) => {
        const room = getMyRoom(socket);
        if (!room) return ack({ ok: false, error: "You're not in a room" });
        if (room.hostSocketId !== socket.id) {
          return ack({ ok: false, error: "Only the host can do that" });
        }
        // Duration changes apply from the NEXT phase — the live timer is untouched.
        room.settings = sanitizeSettings(payload, room.settings);
        room.lastActivityAt = Date.now();
        // Disallowing media force-clears everyone's flags so the roster stays
        // truthful even against clients that ignore the settings broadcast.
        // (Already-flowing P2P tracks can't be severed server-side in a mesh —
        // honest clients stop them on room:settings.)
        let rosterChanged = false;
        for (const p of room.participants.values()) {
          if (!room.settings.allowVideo && p.videoOn) {
            p.videoOn = false;
            rosterChanged = true;
          }
          if (!room.settings.allowAudio && p.audioOn) {
            p.audioOn = false;
            rosterChanged = true;
          }
        }
        io.to(room.id).emit("room:settings", room.settings);
        if (rosterChanged) broadcastParticipants(room);
        sendSystem(room, "Room settings updated");
        broadcastLobby();
        ack({ ok: true, settings: room.settings });
      })
    );

    socket.on(
      "room:kick",
      withAck((payload, ack) => {
        const room = getMyRoom(socket);
        if (!room) return ack({ ok: false, error: "You're not in a room" });
        if (room.hostSocketId !== socket.id) {
          return ack({ ok: false, error: "Only the host can do that" });
        }
        const target = room.participants.get(payload.socketId);
        if (!target || target.socketId === socket.id) {
          return ack({ ok: false, error: "Participant not found" });
        }
        room.kickedUserIds.add(String(target.userId)); // rejoin blocked
        const targetSocket = io.sockets.sockets.get(target.socketId);
        if (targetSocket) targetSocket.emit("room:kicked", {});
        detachSocketFromRoom(target.socketId, room.id);
        store.removeParticipant(room, target.socketId);
        io.to(room.id).emit("rtc:peer-left", { socketId: target.socketId });
        sendSystem(room, `${target.name} was removed by the host`);
        broadcastParticipants(room);
        broadcastLobby();
        ack({ ok: true });
      })
    );

    socket.on(
      "timer:control",
      withAck((payload, ack) => {
        const room = getMyRoom(socket);
        if (!room) return ack({ ok: false, error: "You're not in a room" });
        if (room.hostSocketId !== socket.id) {
          return ack({ ok: false, error: "Only the host can do that" });
        }
        if (!TIMER_ACTIONS.includes(payload.action)) {
          return ack({ ok: false, error: "Unknown timer action" });
        }
        ack(engine.control(room, payload.action));
      })
    );

    socket.on(
      "chat:send",
      withAck((payload, ack) => {
        const room = getMyRoom(socket);
        const me = room && room.participants.get(socket.id);
        if (!me) return ack({ ok: false, error: "You're not in a room" });
        if (!room.settings.chatEnabled) {
          return ack({ ok: false, error: "Chat is disabled in this room" });
        }
        if (room.settings.chatFocusLock && room.timer.phase === "focus") {
          return ack({ ok: false, error: "Chat is locked during focus — see you at the break!" });
        }
        const now = Date.now();
        if (socket.data.lastChatAt && now - socket.data.lastChatAt < CHAT_MIN_INTERVAL_MS) {
          return ack({ ok: false, error: "You're sending messages too fast" });
        }
        const text = sanitizeChatText(payload.text);
        if (!text) return ack({ ok: false, error: "Message can't be empty" });
        socket.data.lastChatAt = now;
        room.lastActivityAt = now;
        const message = store.makeUserMessage(me, text);
        store.addChatMessage(room, message);
        io.to(room.id).emit("chat:message", message);
        ack({ ok: true, message });
      })
    );

    socket.on(
      "reaction:send",
      withAck((payload, ack) => {
        const room = getMyRoom(socket);
        const me = room && room.participants.get(socket.id);
        if (!me) return ack({ ok: false, error: "You're not in a room" });
        if (!isValidReaction(payload.emoji)) {
          return ack({ ok: false, error: "Invalid reaction" });
        }
        if (room.settings.chatFocusLock && room.timer.phase === "focus") {
          return ack({ ok: false, error: "Reactions are locked during focus — see you at the break!" });
        }
        const now = Date.now();
        const recent = (socket.data.reactionTs || []).filter(
          (t) => now - t < REACTION_WINDOW_MS
        );
        if (recent.length >= REACTION_MAX_IN_WINDOW) {
          return ack({ ok: false, error: "You're reacting too fast" });
        }
        recent.push(now);
        socket.data.reactionTs = recent;
        io.to(room.id).emit("reaction:new", {
          id: store.makeReactionId(),
          emoji: payload.emoji,
          name: me.name,
          socketId: socket.id,
        });
        ack({ ok: true });
      })
    );

    socket.on(
      "goals:update",
      withAck((payload, ack) => {
        const room = getMyRoom(socket);
        const me = room && room.participants.get(socket.id);
        if (!me) return ack({ ok: false, error: "You're not in a room" });
        const goals = sanitizeGoals(payload.goals);
        if (!goals) return ack({ ok: false, error: "Invalid goals" });
        // These rebroadcast the full roster — throttle and skip no-ops so a
        // scripted client can't turn 1KB in into 100KB+ out per message.
        if (JSON.stringify(goals) === JSON.stringify(me.goals)) return ack({ ok: true });
        const now = Date.now();
        if (socket.data.lastGoalsAt && now - socket.data.lastGoalsAt < STATE_MIN_INTERVAL_MS) {
          return ack({ ok: false, error: "You're updating goals too fast" });
        }
        socket.data.lastGoalsAt = now;
        me.goals = goals;
        broadcastParticipants(room);
        ack({ ok: true });
      })
    );

    socket.on(
      "media:state",
      withAck((payload, ack) => {
        const room = getMyRoom(socket);
        const me = room && room.participants.get(socket.id);
        if (!me) return ack({ ok: false, error: "You're not in a room" });
        const videoOn = Boolean(payload.videoOn) && room.settings.allowVideo;
        const audioOn = Boolean(payload.audioOn) && room.settings.allowAudio;
        if (me.videoOn === videoOn && me.audioOn === audioOn) return ack({ ok: true });
        const now = Date.now();
        if (socket.data.lastMediaAt && now - socket.data.lastMediaAt < STATE_MIN_INTERVAL_MS) {
          return ack({ ok: false, error: "You're toggling media too fast" });
        }
        socket.data.lastMediaAt = now;
        me.videoOn = videoOn;
        me.audioOn = audioOn;
        broadcastParticipants(room);
        ack({ ok: true });
      })
    );

    socket.on(
      "lobby:subscribe",
      withAck((payload, ack) => {
        socket.join(LOBBY_CHANNEL);
        ack({ ok: true, rooms: store.publicRoomSummaries() });
      })
    );

    socket.on(
      "lobby:unsubscribe",
      withAck((payload, ack) => {
        socket.leave(LOBBY_CHANNEL);
        ack({ ok: true });
      })
    );

    // No ack by spec — invalid signals are dropped silently.
    socket.on("rtc:signal", (payload) => {
      try {
        if (!payload || typeof payload.to !== "string" || payload.data == null) return;
        const room = getMyRoom(socket);
        if (!room || !room.participants.has(socket.id) || !room.participants.has(payload.to)) {
          return;
        }
        // Bound the relay: it forwards opaque bytes between peers, so cap
        // size (SDP tops out ~20KB) and frequency (mesh joins burst ~250).
        let size = 0;
        try {
          size = JSON.stringify(payload.data).length;
        } catch {
          return;
        }
        if (size > RTC_MAX_PAYLOAD_BYTES) return;
        const now = Date.now();
        if (!socket.data.rtcWindowStart || now - socket.data.rtcWindowStart >= RTC_WINDOW_MS) {
          socket.data.rtcWindowStart = now;
          socket.data.rtcCount = 0;
        }
        socket.data.rtcCount += 1;
        if (socket.data.rtcCount > RTC_MAX_IN_WINDOW) return;
        io.to(payload.to).emit("rtc:signal", { from: socket.id, data: payload.data });
      } catch (err) {
        console.error("[studyRoom] rtc relay error:", err);
      }
    });

    socket.on("disconnect", () => {
      try {
        leaveCurrentRoom(socket);
      } catch (err) {
        console.error("[studyRoom] disconnect cleanup error:", err);
      }
    });
  });

  // GC sweep: empty rooms + occupied-but-stale idle rooms (see roomStore.sweep).
  const gcTimer = setInterval(() => {
    try {
      const { closedRooms, changed } = store.sweep();
      for (const closed of closedRooms) {
        // sweep returns {id, participants: []} snapshots — the room object
        // itself is already deleted and cleared.
        io.to(closed.id).emit("room:closed", { reason: "inactive" });
        for (const p of closed.participants) detachSocketFromRoom(p.socketId, closed.id);
      }
      if (changed) broadcastLobby();
    } catch (err) {
      console.error("[studyRoom] gc sweep failed:", err);
    }
  }, GC_INTERVAL_MS);
  if (gcTimer.unref) gcTimer.unref();
}

module.exports = { registerStudyRoomHandlers };

const { verifyToken } = require("../utils/token");

/**
 * Virtual study-room realtime layer.
 *
 * State is held in-memory per process. This is correct for a single backend
 * instance (current Render deployment). To scale horizontally, add the
 * socket.io Redis adapter and move `rooms` into Redis — the handler logic
 * below is written to make that swap localised.
 */
function registerStudyRoomHandlers(io) {
  // roomId -> Map<socketId, participant>
  const rooms = new Map();
  // socketId -> NodeJS.Timeout
  const timers = new Map();

  const roster = (roomId) =>
    Array.from(rooms.get(roomId)?.values() || []).map((p) => ({
      name: p.name,
      avatar: p.avatar,
      socketId: p.socketId,
      joinedAt: p.joinedAt,
      endsAt: p.endsAt,
    }));

  const clearTimer = (socketId) => {
    if (timers.has(socketId)) {
      clearTimeout(timers.get(socketId));
      timers.delete(socketId);
    }
  };

  const leaveRoom = (socket, roomId) => {
    const room = rooms.get(roomId);
    if (room && room.delete(socket.id)) {
      if (room.size === 0) rooms.delete(roomId);
      else io.to(roomId).emit("room-users-updated", roster(roomId));
    }
    socket.leave(roomId);
    clearTimer(socket.id);
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
    socket.on("join-study-room", ({ roomId, name, avatar, studyMinutes }) => {
      if (!roomId || typeof roomId !== "string") return;
      const minutes = Math.min(Math.max(Number(studyMinutes) || 25, 1), 180);
      const durationMs = minutes * 60 * 1000;

      socket.join(roomId);
      if (!rooms.has(roomId)) rooms.set(roomId, new Map());

      rooms.get(roomId).set(socket.id, {
        userId: socket.data.userId,
        name: name || socket.data.email || "Student",
        avatar: avatar || null,
        socketId: socket.id,
        joinedAt: Date.now(),
        endsAt: Date.now() + durationMs,
      });

      clearTimer(socket.id);
      timers.set(
        socket.id,
        setTimeout(() => {
          socket.emit("study-time-ended");
          leaveRoom(socket, roomId);
        }, durationMs)
      );

      io.to(roomId).emit("room-users-updated", roster(roomId));
      socket.emit("joined-room-success", { roomId, endsAt: Date.now() + durationMs });
    });

    socket.on("leave-study-room", (roomId) => leaveRoom(socket, roomId));

    socket.on("disconnect", () => {
      for (const [roomId, users] of rooms) {
        if (users.has(socket.id)) leaveRoom(socket, roomId);
      }
      clearTimer(socket.id);
    });
  });
}

module.exports = { registerStudyRoomHandlers };

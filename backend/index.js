const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");
const { config, assertConfig } = require("./config");
const { corsOriginHandler } = require("./utils/corsOrigin");
const { connectDB, disconnectDB } = require("./db");
const { registerStudyRoomHandlers } = require("./sockets/studyRoom");
const { startSchedulers } = require("./services/scheduler");

const server = http.createServer(app);

// Same origin policy as the HTTP layer (allow-list + *.vercel.app + localhost)
// so websockets work from Vercel preview domains too. maxHttpBufferSize bounds
// any single socket message — the largest legitimate payload is a WebRTC SDP
// (~20KB); the socket.io default would allow 1MB.
const io = new Server(server, {
  cors: { origin: corsOriginHandler, methods: ["GET", "POST"], credentials: true },
  maxHttpBufferSize: 1e5,
});
registerStudyRoomHandlers(io);

async function start() {
  assertConfig();
  await connectDB();
  startSchedulers();

  server.listen(config.port, () => {
    console.log(`[server] AuraSphere API listening on :${config.port} (${config.env})`);
  });
}

// Graceful shutdown
async function shutdown(signal) {
  console.log(`[server] ${signal} received, shutting down...`);
  io.close();
  server.close(async () => {
    await disconnectDB();
    process.exit(0);
  });
  // Force-exit if it hangs
  setTimeout(() => process.exit(1), 10000).unref();
}

if (require.main === module) {
  ["SIGINT", "SIGTERM"].forEach((sig) => process.on(sig, () => shutdown(sig)));
  process.on("unhandledRejection", (reason) => {
    console.error("[fatal] Unhandled promise rejection:", reason);
  });
  process.on("uncaughtException", (err) => {
    console.error("[fatal] Uncaught exception:", err);
    shutdown("uncaughtException");
  });

  start().catch((err) => {
    console.error("[server] Failed to start:", err.message);
    process.exit(1);
  });
}

module.exports = { app, server, io };

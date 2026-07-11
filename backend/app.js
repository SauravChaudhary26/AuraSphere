const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");
const mongoose = require("mongoose");

const { config } = require("./config");
const { corsOriginHandler } = require("./utils/corsOrigin");
const { apiLimiter, authLimiter } = require("./middlewares/rateLimiters");
const { notFound, errorHandler } = require("./middlewares/errorHandlers");
const JwtValidation = require("./middlewares/JwtValidation");

const AuthRouter = require("./routes/authRouter");
const MainRouter = require("./routes/mainRouter");
const cronRouter = require("./routes/cronRouter");
const publicRouter = require("./routes/publicRouter");

const app = express();

app.set("trust proxy", 1); // behind Render/Vercel proxy — needed for correct req.ip + rate limiting

// Security headers. COOP/COEP kept relaxed so Google OAuth popups work.
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  })
);

// CORS allow-list shared with socket.io — see utils/corsOrigin.js.
app.use(
  cors({
    origin: corsOriginHandler,
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(mongoSanitize()); // strip $ and . from keys to block NoSQL injection

// Health checks
app.get("/health", (req, res) => {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  const dbState = states[mongoose.connection.readyState] || "unknown";
  const healthy = mongoose.connection.readyState === 1;
  res.status(healthy ? 200 : 503).json({
    status: healthy ? "ok" : "degraded",
    db: dbState,
    uptime: process.uptime(),
    env: config.env,
  });
});

// Kept for backwards-compatibility with existing smoke test / uptime pings.
app.get("/test", (req, res) => res.send("SERVER IS RUNNING FINE"));

// Routes
app.use("/auth", authLimiter, AuthRouter);
app.use("/cron", cronRouter);
app.use("/", apiLimiter, publicRouter); // public, unauthenticated endpoints
app.use("/", apiLimiter, JwtValidation, MainRouter); // everything below requires auth

// 404 + error handling (must be last)
app.use(notFound);
app.use(errorHandler);

module.exports = app;

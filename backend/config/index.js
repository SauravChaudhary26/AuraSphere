require("dotenv").config();

/**
 * Centralised, validated configuration.
 *
 * Required vars are asserted by assertConfig(), which is called once during
 * server bootstrap (not at import time) so that unit tests can import the
 * Express app without a full environment.
 */

const parseOrigins = (value) =>
  (value || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

const config = {
  env: process.env.NODE_ENV || "development",
  isProd: (process.env.NODE_ENV || "development") === "production",
  port: parseInt(process.env.PORT, 10) || 8080,

  mongoUri: process.env.MONGO_CONN,

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },

  // Comma-separated allow-list, e.g. "http://localhost:3000,https://aura-sphere-teal.vercel.app"
  corsOrigins: parseOrigins(
    process.env.CLIENT_URL || process.env.CORS_ORIGINS || "http://localhost:3000"
  ),

  // Public URL of the frontend (used to build password-reset / OAuth links)
  clientUrl:
    parseOrigins(process.env.CLIENT_URL || "http://localhost:3000")[0] ||
    "http://localhost:3000",

  // Public URL of THIS backend (used to build OAuth redirect URIs)
  appUrl: process.env.APP_URL || `http://localhost:${parseInt(process.env.PORT, 10) || 8080}`,

  cronSecret: process.env.CRON_SECRET,

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI || "postmessage",
    get enabled() {
      return Boolean(this.clientId && this.clientSecret);
    },
  },

  github: {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    get enabled() {
      return Boolean(this.clientId && this.clientSecret);
    },
  },

  facebook: {
    appId: process.env.FACEBOOK_APP_ID,
    appSecret: process.env.FACEBOOK_APP_SECRET,
    get enabled() {
      return Boolean(this.appId && this.appSecret);
    },
  },

  email: {
    apiKey: process.env.RESEND_API_KEY,
    from: process.env.EMAIL_FROM || "AuraSphere <onboarding@resend.dev>",
    get enabled() {
      return Boolean(this.apiKey);
    },
  },

  // IANA timezone that defines the "day" for streaks and daily windows.
  // The campus lives in one timezone, so one canonical day keeps streaks fair.
  dayTimezone: process.env.DAY_TIMEZONE || "Asia/Kolkata",

  // Points awarded for various actions (server-authoritative)
  points: {
    goalCompleted: 10,
    assignmentCompleted: 15,
    challengeCompleted: 25,
    attendanceStreak: 5,
    studySessionCompleted: 20,
  },
};

/**
 * Assert that all hard-required configuration is present. Throws with a clear,
 * actionable message listing everything missing. Call once at startup.
 */
function assertConfig() {
  const missing = [];
  if (!config.mongoUri) missing.push("MONGO_CONN (MongoDB connection string)");
  if (!config.jwt.secret) missing.push("JWT_SECRET (token signing secret)");

  if (missing.length) {
    throw new Error(
      `Missing required environment variables:\n  - ${missing.join(
        "\n  - "
      )}\nSet them in backend/.env (see .env.example).`
    );
  }

  if (!config.isProd) return;

  // Production-only hardening checks.
  const weakSecrets = ["modiji", "secret", "changeme", "jwt", "password"];
  if (config.jwt.secret.length < 32 || weakSecrets.includes(config.jwt.secret.toLowerCase())) {
    throw new Error(
      "JWT_SECRET is too weak for production. Use a random value of at least 32 characters " +
        "(e.g. `node -e \"console.log(require('crypto').randomBytes(48).toString('hex'))\"`)."
    );
  }
}

module.exports = { config, assertConfig };

const { config } = require("../config");

/**
 * Shared CORS origin policy for Express (`cors`) AND socket.io.
 *
 * Allow-list: configured origins (CLIENT_URL / CORS_ORIGINS) plus any
 * *.vercel.app deployment (production + preview URLs), plus localhost for dev.
 * Disallowed origins are rejected WITHOUT an ACAO header (cb(null, false))
 * rather than throwing, so a blocked preflight fails cleanly instead of 500-ing.
 */
const VERCEL_APP = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i;
const LOCALHOST = /^http:\/\/localhost(:\d+)?$/i;

const isAllowedOrigin = (origin) =>
  !origin ||
  config.corsOrigins.includes(origin) ||
  VERCEL_APP.test(origin) ||
  LOCALHOST.test(origin);

// (origin, cb) signature is accepted by both the `cors` package and socket.io.
const corsOriginHandler = (origin, cb) => cb(null, isAllowedOrigin(origin));

module.exports = { isAllowedOrigin, corsOriginHandler };

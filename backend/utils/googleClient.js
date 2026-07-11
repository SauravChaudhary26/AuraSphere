const { google } = require("googleapis");
const { config } = require("../config");

let client = null;

/**
 * Lazily build the Google OAuth2 client. Returns null when Google login is not
 * configured so the app boots and runs without Google credentials (the auth
 * controller responds 501 for Google login in that case).
 */
function getOAuthClient() {
  if (!config.google.enabled) return null;
  if (!client) {
    client = new google.auth.OAuth2(
      config.google.clientId,
      config.google.clientSecret,
      config.google.redirectUri
    );
  }
  return client;
}

module.exports = { getOAuthClient };

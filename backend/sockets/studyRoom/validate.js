const { ROOM_EMOJIS, REACTION_EMOJIS, DEFAULT_SETTINGS } = require("./constants");

/** Never trust client payloads — everything below clamps/sanitizes to spec bounds. */

const clampInt = (value, min, max, fallback) => {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(n, min), max);
};

/**
 * Merge a partial client settings payload over `base` (defaults on create,
 * current settings on edit) and clamp every field to canonical bounds.
 * Always returns a complete, server-canonical Settings object.
 */
function sanitizeSettings(input, base = DEFAULT_SETTINGS) {
  const src = input && typeof input === "object" ? input : {};
  const bool = (key) => (src[key] === undefined ? base[key] : Boolean(src[key]));
  const int = (key, min, max) =>
    src[key] === undefined ? base[key] : clampInt(src[key], min, max, base[key]);

  let name = base.name;
  if (typeof src.name === "string") {
    const trimmed = src.name.trim().slice(0, 40);
    if (trimmed.length >= 3) name = trimmed;
  }

  return {
    name,
    emoji: ROOM_EMOJIS.includes(src.emoji) ? src.emoji : base.emoji,
    isPrivate: bool("isPrivate"),
    maxParticipants: int("maxParticipants", 2, 12),
    focusMinutes: int("focusMinutes", 5, 120),
    shortBreakMinutes: int("shortBreakMinutes", 1, 30),
    longBreakMinutes: int("longBreakMinutes", 5, 60),
    cyclesBeforeLongBreak: int("cyclesBeforeLongBreak", 2, 8),
    allowVideo: bool("allowVideo"),
    allowAudio: bool("allowAudio"),
    chatEnabled: bool("chatEnabled"),
    chatFocusLock: bool("chatFocusLock"),
  };
}

/** Returns trimmed text (max 500 chars) or null when empty/not a string. */
function sanitizeChatText(text) {
  if (typeof text !== "string") return null;
  const trimmed = text.trim().slice(0, 500);
  return trimmed.length > 0 ? trimmed : null;
}

/** Uppercased/trimmed join code, or "" when unusable. */
function sanitizeCode(code) {
  return typeof code === "string" ? code.trim().toUpperCase() : "";
}

const isValidReaction = (emoji) => REACTION_EMOJIS.includes(emoji);

/**
 * Full-replace goals list: ≤5 items of { id (string ≤40), text (1..100), done }.
 * Invalid items are dropped, unknown keys stripped. Returns null when the
 * payload is not an array at all.
 */
function sanitizeGoals(input) {
  if (!Array.isArray(input)) return null;
  const out = [];
  for (const item of input) {
    if (out.length >= 5) break;
    if (!item || typeof item !== "object") continue;
    const id =
      typeof item.id === "string" && item.id.length > 0 && item.id.length <= 40
        ? item.id
        : null;
    const text = typeof item.text === "string" ? item.text.trim().slice(0, 100) : "";
    if (!id || !text) continue;
    out.push({ id, text, done: Boolean(item.done) });
  }
  return out;
}

module.exports = {
  clampInt,
  sanitizeSettings,
  sanitizeChatText,
  sanitizeCode,
  sanitizeGoals,
  isValidReaction,
};

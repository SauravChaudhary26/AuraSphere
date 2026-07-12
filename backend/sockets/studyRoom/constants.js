/** Shared constants for the study-room realtime layer. */

// Premium reactions are defined next to the store item that sells them.
const { PREMIUM_REACTION_EMOJIS } = require("../../services/storeCatalog");

const ROOM_EMOJIS = ["📚", "🎯", "🔥", "🧠", "☕", "🌙", "⚡", "🌸"];
const REACTION_EMOJIS = ["🔥", "👏", "💪", "☕", "🎉", "🧠", "❤️", "😴"];

const DEFAULT_SETTINGS = {
  name: "Study Room",
  emoji: "📚",
  isPrivate: false,
  maxParticipants: 8,
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  cyclesBeforeLongBreak: 4,
  allowVideo: true,
  allowAudio: true,
  chatEnabled: true,
  chatFocusLock: false,
};

// No 0/O/1/I — codes stay readable when shared aloud or handwritten.
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 6;

const MAX_ROOMS = 200;
const MAX_ROOMS_PER_USER = 3;
const CHAT_HISTORY_MAX = 200;
const CHAT_JOIN_SLICE = 50;
const CHAT_MIN_INTERVAL_MS = 750;
const REACTION_WINDOW_MS = 3000;
const REACTION_MAX_IN_WINDOW = 3;
const STATE_MIN_INTERVAL_MS = 300; // goals:update / media:state (both rebroadcast the roster)
// rtc:signal relay bounds — a 12-peer mesh join bursts ~250 signals, SDP tops out ~20KB.
const RTC_MAX_PAYLOAD_BYTES = 64 * 1024;
const RTC_WINDOW_MS = 10 * 1000;
const RTC_MAX_IN_WINDOW = 400;
// Private-code guessing gets exponentially useless once failures are metered.
const JOIN_FAIL_THRESHOLD = 10;
const JOIN_FAIL_COOLDOWN_MS = 5000;

const DAILY_AWARD_CAP = 8;

const GC_INTERVAL_MS = 10 * 60 * 1000;
const GC_IDLE_MAX_MS = 2 * 60 * 60 * 1000;

const LOBBY_CHANNEL = "__lobby__";

module.exports = {
  ROOM_EMOJIS,
  REACTION_EMOJIS,
  PREMIUM_REACTION_EMOJIS,
  DEFAULT_SETTINGS,
  CODE_ALPHABET,
  CODE_LENGTH,
  MAX_ROOMS,
  MAX_ROOMS_PER_USER,
  CHAT_HISTORY_MAX,
  CHAT_JOIN_SLICE,
  CHAT_MIN_INTERVAL_MS,
  REACTION_WINDOW_MS,
  REACTION_MAX_IN_WINDOW,
  STATE_MIN_INTERVAL_MS,
  RTC_MAX_PAYLOAD_BYTES,
  RTC_WINDOW_MS,
  RTC_MAX_IN_WINDOW,
  JOIN_FAIL_THRESHOLD,
  JOIN_FAIL_COOLDOWN_MS,
  DAILY_AWARD_CAP,
  GC_INTERVAL_MS,
  GC_IDLE_MAX_MS,
  LOBBY_CHANNEL,
};

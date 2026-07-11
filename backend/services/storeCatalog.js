// Static Aura store catalog. Prices are server-authoritative; the client can
// never set them. Redeeming spends aura via the ledger (see storeController).
const STORE_CATALOG = [
  { key: "streak_freeze", name: "Streak Freeze", description: "Protect your streak for one missed day.", icon: "❄️", cost: 150, category: "power-ups" },
  { key: "double_aura", name: "Double Aura (1 day)", description: "Earn 2× Aura on everything for 24 hours.", icon: "⚡", cost: 400, category: "power-ups" },
  { key: "theme_midnight", name: "Midnight Theme", description: "Unlock an exclusive dark accent theme.", icon: "🌙", cost: 300, category: "cosmetics" },
  { key: "badge_scholar", name: "Scholar Badge", description: "Show a scholar badge on the leaderboard.", icon: "🎓", cost: 500, category: "cosmetics" },
  { key: "avatar_frame_gold", name: "Gold Avatar Frame", description: "A shining gold frame around your avatar.", icon: "🖼️", cost: 750, category: "cosmetics" },
  { key: "focus_sound_pack", name: "Focus Sound Pack", description: "Ambient sounds for study-room sessions.", icon: "🎧", cost: 250, category: "power-ups" },
];

const byKey = Object.fromEntries(STORE_CATALOG.map((i) => [i.key, i]));

module.exports = { STORE_CATALOG, getStoreItem: (key) => byKey[key] || null };

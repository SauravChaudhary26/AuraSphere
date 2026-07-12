const crypto = require("crypto");

/**
 * The Aura Store catalog — server-authoritative product definitions.
 * Prices are never accepted from the client; redeeming spends aura via the
 * ledger (see storeController).
 *
 * kind:
 * - "consumable": repeat-purchasable; its effect is applied at purchase time
 *   (freeze stock, boost timer, mystery prize).
 * - "unlock": one-time purchase; OWNING it is the effect (themes, packs) —
 *   consumers check the buyer's redemptions.
 * - "equippable": one-time purchase that can be equipped into `slot`
 *   (badge | frame | nameEffect) and is shown on public surfaces.
 *
 * Every effect here has a real consumer: streaks/boosts in pointsService,
 * themes in the frontend token sheet, badges/frames/name effects on the
 * leaderboard + profile, sounds/reactions in study rooms, celebrations on
 * goal/assignment completion. Add an item ONLY together with its consumer.
 */

const HOUR_MS = 60 * 60 * 1000;

/** Extra study-room reactions unlocked by `reaction_pack` (validated server-side). */
const PREMIUM_REACTION_EMOJIS = ["🤯", "🚀", "💎", "🦄", "🍕", "🌈"];

/** Extra ambient soundscapes unlocked by `focus_sound_pack` (client-side). */
const PREMIUM_SOUNDS = ["fire", "forest", "night"];

/**
 * Mystery Box prize table. Chances sum to 1; expected value ≈ 77 Aura on a
 * 100 Aura ticket — a house edge keeps the box fun without minting Aura.
 * Winnings are exempt from Double Aura (see pointsService) or the box would
 * pay out 154 on average and become a money printer.
 */
const MYSTERY_PRIZES = [
  { chance: 0.35, prize: 20 },
  { chance: 0.3, prize: 50 },
  { chance: 0.2, prize: 100 },
  { chance: 0.1, prize: 150 },
  { chance: 0.05, prize: 400 },
];

/** Roll a prize. `rand01` is injectable for tests; defaults to a secure roll. */
function rollMysteryPrize(rand01 = crypto.randomInt(0, 1_000_000) / 1_000_000) {
  let cumulative = 0;
  for (const { chance, prize } of MYSTERY_PRIZES) {
    cumulative += chance;
    if (rand01 < cumulative) return prize;
  }
  return MYSTERY_PRIZES[MYSTERY_PRIZES.length - 1].prize;
}

const STORE_CATALOG = [
  /* ------------------------------------------------------------ power-ups */
  {
    key: "streak_freeze",
    name: "Streak Freeze",
    description: "Protects your daily streak for one missed day. Consumed automatically — stock up to 3.",
    icon: "❄️",
    cost: 150,
    category: "power-ups",
    kind: "consumable",
    maxStock: 3,
  },
  {
    key: "double_aura",
    name: "Double Aura (24h)",
    description: "Earn 2× Aura on everything — goals, assignments, challenges and study sessions — for 24 hours. Stacks up to 3 days.",
    icon: "⚡",
    cost: 400,
    category: "power-ups",
    kind: "consumable",
    effect: { durationMs: 24 * HOUR_MS, maxStackMs: 72 * HOUR_MS },
  },

  /* ------------------------------------------------------------ cosmetics */
  {
    key: "theme_midnight",
    name: "Midnight Theme",
    description: "Molten gold on deep-space blue — an exclusive look for the whole app.",
    icon: "🌙",
    cost: 300,
    category: "cosmetics",
    kind: "unlock",
    effect: { theme: "midnight" },
  },
  {
    key: "theme_sakura",
    name: "Sakura Theme",
    description: "Soft cherry-blossom pinks for calm, pretty study sessions.",
    icon: "🌸",
    cost: 350,
    category: "cosmetics",
    kind: "unlock",
    effect: { theme: "sakura" },
  },
  {
    key: "theme_terminal",
    name: "Terminal Theme",
    description: "Phosphor green on black. For those who grind in the matrix.",
    icon: "👾",
    cost: 450,
    category: "cosmetics",
    kind: "unlock",
    effect: { theme: "terminal" },
  },
  {
    key: "badge_scholar",
    name: "Scholar Badge",
    description: "A scholar's crest next to your name on the leaderboard and profile.",
    icon: "🎓",
    cost: 500,
    category: "cosmetics",
    kind: "equippable",
    slot: "badge",
  },
  {
    key: "badge_night_owl",
    name: "Night Owl Badge",
    description: "For the ones still earning Aura when everyone else is asleep.",
    icon: "🦉",
    cost: 400,
    category: "cosmetics",
    kind: "equippable",
    slot: "badge",
  },
  {
    key: "badge_on_fire",
    name: "On Fire Badge",
    description: "Announce your streak supremacy with a flame next to your name.",
    icon: "🔥",
    cost: 650,
    category: "cosmetics",
    kind: "equippable",
    slot: "badge",
  },
  {
    key: "avatar_frame_gold",
    name: "Gold Avatar Frame",
    description: "A shining gold ring around your avatar, everywhere you appear.",
    icon: "🖼️",
    cost: 750,
    category: "cosmetics",
    kind: "equippable",
    slot: "frame",
  },
  {
    key: "avatar_frame_aura",
    name: "Aura Frame",
    description: "A living, spinning aura around your avatar. The ultimate flex.",
    icon: "💫",
    cost: 1500,
    category: "cosmetics",
    kind: "equippable",
    slot: "frame",
  },
  {
    key: "name_gradient",
    name: "Golden Name",
    description: "Your name shimmers in animated gold on the leaderboard.",
    icon: "✨",
    cost: 800,
    category: "cosmetics",
    kind: "equippable",
    slot: "nameEffect",
  },

  /* ------------------------------------------------------------------ fun */
  {
    key: "focus_sound_pack",
    name: "Focus Sound Pack",
    description: "Unlock 3 extra study-room soundscapes: Fireplace, Forest and Night Crickets.",
    icon: "🎧",
    cost: 250,
    category: "fun",
    kind: "unlock",
    effect: { sounds: PREMIUM_SOUNDS },
  },
  {
    key: "reaction_pack",
    name: "Reaction Pack",
    description: "Six extra reactions for study rooms: 🤯 🚀 💎 🦄 🍕 🌈",
    icon: "🚀",
    cost: 300,
    category: "fun",
    kind: "unlock",
    effect: { reactions: PREMIUM_REACTION_EMOJIS },
  },
  {
    key: "celebration_pack",
    name: "Celebration Pack",
    description: "Confetti and a victory chime every time you complete a goal or assignment.",
    icon: "🎉",
    cost: 350,
    category: "fun",
    kind: "unlock",
  },
  {
    key: "mystery_box",
    name: "Mystery Box",
    description: "Feeling lucky? Contains 20 to 400 Aura. Average luck won't beat the price…",
    icon: "🎁",
    cost: 100,
    category: "fun",
    kind: "consumable",
    effect: { mystery: true },
  },
];

const byKey = Object.fromEntries(STORE_CATALOG.map((i) => [i.key, i]));

module.exports = {
  STORE_CATALOG,
  getStoreItem: (key) => byKey[key] || null,
  PREMIUM_REACTION_EMOJIS,
  PREMIUM_SOUNDS,
  MYSTERY_PRIZES,
  rollMysteryPrize,
};

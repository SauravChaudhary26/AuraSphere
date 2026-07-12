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
 * Mystery Box prize table. Chances sum to 1; expected value ≈ 115.5 Aura on a
 * 150 Aura ticket (~77% payout) — a house edge keeps the box fun without
 * minting Aura. Winnings are exempt from Double Aura (see pointsService) or
 * the box would pay out 231 on average and become a money printer.
 */
const MYSTERY_PRIZES = [
  { chance: 0.35, prize: 30 },
  { chance: 0.3, prize: 75 },
  { chance: 0.2, prize: 150 },
  { chance: 0.1, prize: 225 },
  { chance: 0.05, prize: 600 },
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

/**
 * Premium app themes — owning one lets the client apply it app-wide.
 * The consumer is the frontend: every `effect.theme` id here MUST have a
 * matching `[data-theme="<id>"]` block in frontend/src/styles/tokens.css and
 * an entry in frontend/src/lib/cosmetics.js (tokens.css sync is enforced by
 * storeCatalog.test.js).
 */
const theme = (id, name, icon, cost, description) => ({
  key: `theme_${id}`,
  name,
  description,
  icon,
  cost,
  category: "themes",
  kind: "unlock",
  effect: { theme: id },
});

const STORE_CATALOG = [
  /* ------------------------------------------------------------ power-ups */
  {
    key: "streak_freeze",
    name: "Streak Freeze",
    description: "Protects your daily streak for one missed day. Consumed automatically — stock up to 3.",
    icon: "❄️",
    cost: 225,
    category: "power-ups",
    kind: "consumable",
    maxStock: 3,
  },
  {
    key: "double_aura",
    name: "Double Aura (24h)",
    description: "Earn 2× Aura on everything — goals, assignments, challenges and study sessions — for 24 hours. Stacks up to 3 days.",
    icon: "⚡",
    cost: 600,
    category: "power-ups",
    kind: "consumable",
    effect: { durationMs: 24 * HOUR_MS, maxStackMs: 72 * HOUR_MS },
  },

  /* -------------------------------------------------------------- themes */
  theme("paper", "Paper", "📄", 400, "E-ink minimalism — black ink on soft paper, nothing else."),
  theme("frost", "Frost", "🌬️", 450, "Crisp ice-blue on arctic white. Clean, cold, clear-headed."),
  theme("midnight", "Midnight", "🌙", 450, "Molten gold on deep-space blue — an exclusive look for the whole app."),
  theme("dune", "Dune", "🏜️", 475, "Sun-baked sand and terracotta. Desert calm for long afternoons."),
  theme("lagoon", "Lagoon", "🐚", 500, "Clear tropical aqua over white-sand shallows."),
  theme("matcha", "Matcha", "🍵", 500, "Fresh-whisked greens on warm cream. Deep-breath studying."),
  theme("lilac", "Lilac", "🪻", 525, "Airy lavender pastels. Spring mornings, gentle focus."),
  theme("sakura", "Sakura", "🌸", 525, "Soft cherry-blossom pinks for calm, pretty study sessions."),
  theme("coral", "Coral", "🌅", 550, "Golden-hour peach and coral. Sunset sessions forever."),
  theme("graphite", "Graphite", "🪨", 575, "Pure monochrome. No color, no distractions, all focus."),
  theme("espresso", "Espresso", "☕", 600, "Dark-roast browns with caramel crema. Fuel for all-nighters."),
  theme("evergreen", "Evergreen", "🌲", 600, "Misty spruce and cool mint — a quiet forest at dusk."),
  theme("glacier", "Glacier", "🧊", 625, "Cool nordic greys with ice-blue accents. Stay frosty."),
  theme("storm", "Storm", "⛈️", 650, "Charged electric blue on thunderhead slate."),
  theme("velvet", "Velvet", "💜", 650, "Plush indigo with periwinkle light. Soft on midnight eyes."),
  theme("terminal", "Terminal", "👾", 675, "Phosphor green on black. For those who grind in the matrix."),
  theme("amethyst", "Amethyst", "🔮", 700, "Royal violet with a crystal glow. For mystic grinders."),
  theme("rosewood", "Rosewood", "🥀", 700, "Deep wine with rose-gold shimmer. Dark academia, romantic edition."),
  theme("abyss", "Abyss", "🌊", 750, "Bioluminescent cyan over deep-sea navy. Study in the trench."),
  theme("ember", "Ember", "🌋", 750, "Warm charcoal with ember orange. Cozy campfire energy."),
  theme("aurora", "Aurora", "🌌", 800, "Northern lights rippling over an arctic night sky."),
  theme("neon", "Neon", "🌆", 850, "Hot magenta on cyber black. Downtown at 2am."),
  theme("obsidian", "Obsidian", "🖤", 1000, "Pure OLED black with molten gold. Lights out, Aura on."),

  /* ------------------------------------------------------------ cosmetics */
  {
    key: "badge_scholar",
    name: "Scholar Badge",
    description: "A scholar's crest next to your name on the leaderboard and profile.",
    icon: "🎓",
    cost: 750,
    category: "cosmetics",
    kind: "equippable",
    slot: "badge",
  },
  {
    key: "badge_night_owl",
    name: "Night Owl Badge",
    description: "For the ones still earning Aura when everyone else is asleep.",
    icon: "🦉",
    cost: 600,
    category: "cosmetics",
    kind: "equippable",
    slot: "badge",
  },
  {
    key: "badge_on_fire",
    name: "On Fire Badge",
    description: "Announce your streak supremacy with a flame next to your name.",
    icon: "🔥",
    cost: 975,
    category: "cosmetics",
    kind: "equippable",
    slot: "badge",
  },
  {
    key: "avatar_frame_gold",
    name: "Gold Avatar Frame",
    description: "A shining gold ring around your avatar, everywhere you appear.",
    icon: "🖼️",
    cost: 1125,
    category: "cosmetics",
    kind: "equippable",
    slot: "frame",
  },
  {
    key: "avatar_frame_aura",
    name: "Aura Frame",
    description: "A living, spinning aura around your avatar. The ultimate flex.",
    icon: "💫",
    cost: 2250,
    category: "cosmetics",
    kind: "equippable",
    slot: "frame",
  },
  {
    key: "name_gradient",
    name: "Golden Name",
    description: "Your name shimmers in animated gold on the leaderboard.",
    icon: "✨",
    cost: 1200,
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
    cost: 375,
    category: "fun",
    kind: "unlock",
    effect: { sounds: PREMIUM_SOUNDS },
  },
  {
    key: "reaction_pack",
    name: "Reaction Pack",
    description: "Six extra reactions for study rooms: 🤯 🚀 💎 🦄 🍕 🌈",
    icon: "🚀",
    cost: 450,
    category: "fun",
    kind: "unlock",
    effect: { reactions: PREMIUM_REACTION_EMOJIS },
  },
  {
    key: "celebration_pack",
    name: "Celebration Pack",
    description: "Confetti and a victory chime every time you complete a goal or assignment.",
    icon: "🎉",
    cost: 525,
    category: "fun",
    kind: "unlock",
  },
  {
    key: "mystery_box",
    name: "Mystery Box",
    description: "Feeling lucky? Contains 30 to 600 Aura. Average luck won't beat the price…",
    icon: "🎁",
    cost: 150,
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

/**
 * Display metadata for Aura Store cosmetics, keyed by catalog itemKey.
 * The backend stores WHICH key a user equipped (User.equipped); how each key
 * looks is a pure frontend concern defined here.
 */

export const BADGES = {
  badge_scholar: { emoji: "🎓", label: "Scholar" },
  badge_night_owl: { emoji: "🦉", label: "Night Owl" },
  badge_on_fire: { emoji: "🔥", label: "On Fire" },
};

export const FRAMES = {
  avatar_frame_gold: "frame-gold",
  avatar_frame_aura: "frame-aura",
};

export const NAME_EFFECTS = {
  name_gradient: "name-gradient",
};

/**
 * Store-unlocked themes: catalog itemKey → data-theme id.
 * `dark` tells the ThemeToggle which base mode a theme belongs to; `preview`
 * paints the mini swatch on Store cards (bg/card/ink/accent = the theme's
 * ground/surface/ink/primary tokens in styles/tokens.css — keep in sync).
 */
export const PREMIUM_THEMES = {
  theme_midnight: { id: "midnight", label: "Midnight", dark: true, preview: { bg: "#070b16", card: "#0c1224", ink: "#e9eefb", accent: "#f5c53d" } },
  theme_sakura: { id: "sakura", label: "Sakura", dark: false, preview: { bg: "#fdf3f6", card: "#ffffff", ink: "#33202b", accent: "#d6336c" } },
  theme_terminal: { id: "terminal", label: "Terminal", dark: true, preview: { bg: "#040804", card: "#0a130b", ink: "#d4f7dc", accent: "#35d058" } },
  theme_paper: { id: "paper", label: "Paper", dark: false, preview: { bg: "#f7f7f5", card: "#ffffff", ink: "#1a1a18", accent: "#1f1f1d" } },
  theme_frost: { id: "frost", label: "Frost", dark: false, preview: { bg: "#f3f7fb", card: "#ffffff", ink: "#17222e", accent: "#1971c2" } },
  theme_dune: { id: "dune", label: "Dune", dark: false, preview: { bg: "#faf3ea", card: "#ffffff", ink: "#2e2318", accent: "#c2410c" } },
  theme_lagoon: { id: "lagoon", label: "Lagoon", dark: false, preview: { bg: "#effaf8", card: "#ffffff", ink: "#143230", accent: "#0b7285" } },
  theme_matcha: { id: "matcha", label: "Matcha", dark: false, preview: { bg: "#f4f7ec", card: "#ffffff", ink: "#1f2a17", accent: "#4d7c0f" } },
  theme_lilac: { id: "lilac", label: "Lilac", dark: false, preview: { bg: "#f8f4fd", card: "#ffffff", ink: "#241a33", accent: "#7048e8" } },
  theme_coral: { id: "coral", label: "Coral", dark: false, preview: { bg: "#fff4ee", card: "#ffffff", ink: "#33221c", accent: "#e8590c" } },
  theme_graphite: { id: "graphite", label: "Graphite", dark: true, preview: { bg: "#101012", card: "#18181b", ink: "#f2f2f3", accent: "#d4d4dc" } },
  theme_espresso: { id: "espresso", label: "Espresso", dark: true, preview: { bg: "#120d09", card: "#1d1510", ink: "#f3ebe2", accent: "#dda15e" } },
  theme_evergreen: { id: "evergreen", label: "Evergreen", dark: true, preview: { bg: "#071510", card: "#0c211a", ink: "#e6f5ec", accent: "#34d399" } },
  theme_glacier: { id: "glacier", label: "Glacier", dark: true, preview: { bg: "#10141c", card: "#171c26", ink: "#eceff4", accent: "#74c0fc" } },
  theme_storm: { id: "storm", label: "Storm", dark: true, preview: { bg: "#0d1117", card: "#141a23", ink: "#edf2f9", accent: "#3d8bfd" } },
  theme_velvet: { id: "velvet", label: "Velvet", dark: true, preview: { bg: "#0d102a", card: "#141838", ink: "#eceefc", accent: "#8494ff" } },
  theme_amethyst: { id: "amethyst", label: "Amethyst", dark: true, preview: { bg: "#0e0a1a", card: "#171029", ink: "#f0eafb", accent: "#a78bfa" } },
  theme_rosewood: { id: "rosewood", label: "Rosewood", dark: true, preview: { bg: "#170b10", card: "#221118", ink: "#f9ecf1", accent: "#ea7a9a" } },
  theme_abyss: { id: "abyss", label: "Abyss", dark: true, preview: { bg: "#05121c", card: "#0a1b29", ink: "#e3f2fb", accent: "#2cc7ee" } },
  theme_ember: { id: "ember", label: "Ember", dark: true, preview: { bg: "#140d0a", card: "#1f1512", ink: "#f7ede6", accent: "#ff6b3d" } },
  theme_aurora: { id: "aurora", label: "Aurora", dark: true, preview: { bg: "#0a1220", card: "#101a2e", ink: "#eaf3f5", accent: "#3ce6b0" } },
  theme_neon: { id: "neon", label: "Neon", dark: true, preview: { bg: "#0a0612", card: "#130b1f", ink: "#f4ecff", accent: "#ef4bbe" } },
  theme_obsidian: { id: "obsidian", label: "Obsidian", dark: true, preview: { bg: "#000000", card: "#0b0b0d", ink: "#f5f2e9", accent: "#f0b429" } },
};

export const badgeFor = (equipped) => BADGES[equipped?.badge] || null;
export const frameClass = (equipped) => FRAMES[equipped?.frame] || null;
export const nameClass = (equipped) => NAME_EFFECTS[equipped?.nameEffect] || null;

/** Whether a data-theme id renders as a dark scheme (drives the ThemeToggle icon). */
export const isDarkTheme = (themeId) =>
  themeId === "dark" ||
  Object.values(PREMIUM_THEMES).some((t) => t.id === themeId && t.dark);

/** Apply any theme id (light/dark/midnight/…) and persist it like ThemeToggle does. */
export function applyTheme(themeId) {
  document.documentElement.setAttribute("data-theme", themeId);
  try {
    localStorage.setItem("theme", themeId);
  } catch {
    /* private mode */
  }
}

export const currentTheme = () =>
  (typeof document !== "undefined" && document.documentElement.getAttribute("data-theme")) ||
  "light";

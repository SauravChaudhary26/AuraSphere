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

/** Store-unlocked themes: catalog itemKey → data-theme id. */
export const PREMIUM_THEMES = {
  theme_midnight: { id: "midnight", label: "Midnight" },
  theme_sakura: { id: "sakura", label: "Sakura" },
  theme_terminal: { id: "terminal", label: "Terminal" },
};

export const badgeFor = (equipped) => BADGES[equipped?.badge] || null;
export const frameClass = (equipped) => FRAMES[equipped?.frame] || null;
export const nameClass = (equipped) => NAME_EFFECTS[equipped?.nameEffect] || null;

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

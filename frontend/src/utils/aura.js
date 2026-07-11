// Aura → level mapping. 500 aura per level; used by the ring + profile.
const PER_LEVEL = 500;

export function levelFromAura(aura = 0) {
  const a = Math.max(0, Number(aura) || 0);
  const level = Math.floor(a / PER_LEVEL) + 1;
  const base = (level - 1) * PER_LEVEL;
  const into = a - base;
  const pct = Math.round((into / PER_LEVEL) * 100);
  const toNext = PER_LEVEL - into;
  return { level, into, span: PER_LEVEL, pct, toNext };
}

export function formatDate(input) {
  if (!input) return "";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export function daysUntil(input) {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return null;
  const ms = d.setHours(23, 59, 59, 999) - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

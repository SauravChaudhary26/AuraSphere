const User = require("../models/User");
const { config } = require("../config");

/**
 * Daily activity streaks.
 *
 * A day "counts" when the user earns any productive aura (see pointsService —
 * mystery-box winnings and refunds are excluded). Days are bounded in
 * config.dayTimezone so everyone on campus shares the same midnight.
 *
 * Missed days can be covered by Streak Freezes (store power-up): one freeze
 * absorbs one missed day. Freezes are only consumed when they fully bridge the
 * gap — if the streak breaks anyway, the stock is kept for the next run.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

/** "YYYY-MM-DD" for `date` in the canonical day timezone. */
function dayString(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: config.dayTimezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** Whole days from one day-string to another (positive when `to` is later). */
function daysBetween(fromDay, toDay) {
  return Math.round((Date.parse(toDay) - Date.parse(fromDay)) / DAY_MS);
}

const normalize = (s) => ({
  current: s?.current || 0,
  longest: s?.longest || 0,
  lastDay: s?.lastDay || null,
  freezes: s?.freezes || 0,
});

/**
 * Pure transition: the streak state after the user is active on `today`.
 * Returns { ...state, changed } — `changed` false when today already counted.
 */
function nextStreak(prev, today) {
  const s = normalize(prev);
  // Same day (or a clock oddity putting lastDay "after" today): nothing to do.
  if (s.lastDay && s.lastDay >= today) return { ...s, changed: false };

  let { current, freezes } = s;
  if (!s.lastDay) {
    current = 1; // first ever active day
  } else {
    const gap = daysBetween(s.lastDay, today) - 1; // full days missed
    if (gap <= 0) {
      current += 1; // consecutive day
    } else if (gap <= freezes) {
      freezes -= gap; // freezes bridge the gap — streak survives
      current += 1;
    } else {
      current = 1; // broken; keep the freeze stock for the next run
    }
  }
  return {
    current,
    longest: Math.max(s.longest, current),
    lastDay: today,
    freezes,
    changed: true,
  };
}

/**
 * Pure, display-only view of a streak "right now" (no activity implied):
 * whether it's still alive, already banked today, or effectively broken.
 */
function effectiveStreak(streak, today = dayString()) {
  const s = normalize(streak);
  const base = { longest: s.longest, freezes: s.freezes, earnedToday: false };
  if (!s.lastDay) return { ...base, current: 0 };
  if (s.lastDay >= today) return { ...base, current: s.current, earnedToday: true };
  const gap = daysBetween(s.lastDay, today) - 1;
  if (gap <= 0 || gap <= s.freezes) return { ...base, current: s.current }; // alive (at risk / frozen)
  return { ...base, current: 0 }; // would reset on next activity
}

/**
 * Record productive activity for `userId` today. Concurrency-safe: the write
 * is conditioned on lastDay ≠ today, so racing awards can't double-count.
 */
async function recordActivity(userId) {
  const user = await User.findById(userId).select("streak").lean();
  if (!user) return null;
  const today = dayString();
  const next = nextStreak(user.streak, today);
  if (!next.changed) return next;
  await User.updateOne(
    // $ne matches documents where the field is missing too, so first-ever
    // activity and legacy users without a streak block both pass.
    { _id: userId, "streak.lastDay": { $ne: today } },
    {
      $set: {
        "streak.current": next.current,
        "streak.longest": next.longest,
        "streak.lastDay": today,
        "streak.freezes": next.freezes,
      },
    }
  );
  return next;
}

module.exports = { dayString, daysBetween, nextStreak, effectiveStreak, recordActivity };

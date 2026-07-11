const Goal = require("../models/Goal");
const Challenge = require("../models/Challenge");
const Attendance = require("../models/attendance");
const User = require("../models/User");

// Achievements are DERIVED from real stats each request — they can't be forged.
const DEFS = [
  { id: "first_goal", name: "First Steps", desc: "Complete your first goal", icon: "🎯", metric: "goalsCompleted", target: 1 },
  { id: "goal_10", name: "Goal Getter", desc: "Complete 10 goals", icon: "✅", metric: "goalsCompleted", target: 10 },
  { id: "goal_50", name: "Unstoppable", desc: "Complete 50 goals", icon: "🔥", metric: "goalsCompleted", target: 50 },
  { id: "aura_500", name: "Rising Aura", desc: "Reach 500 Aura", icon: "✨", metric: "aura", target: 500 },
  { id: "aura_2000", name: "Aura Master", desc: "Reach 2,000 Aura", icon: "🌟", metric: "aura", target: 2000 },
  { id: "challenge_win", name: "Challenger", desc: "Complete a friend challenge", icon: "⚔️", metric: "challengesCompleted", target: 1 },
  { id: "attend_20", name: "Regular", desc: "Mark 20 classes present", icon: "📚", metric: "attendancePresent", target: 20 },
];

async function getStats(userId) {
  const [goalsCompleted, user, challengesCompleted, attendancePresent] = await Promise.all([
    Goal.countDocuments({ userId, completed: true }),
    User.findById(userId).select("aura").lean(),
    Challenge.countDocuments({ receiver: userId, status: "completed" }),
    Attendance.countDocuments({ studentId: userId, status: "present" }),
  ]);
  return { goalsCompleted, aura: user?.aura || 0, challengesCompleted, attendancePresent };
}

async function getAchievements(userId) {
  const stats = await getStats(userId);
  const achievements = DEFS.map((d) => {
    const value = stats[d.metric] || 0;
    return {
      id: d.id,
      name: d.name,
      desc: d.desc,
      icon: d.icon,
      target: d.target,
      value,
      earned: value >= d.target,
      progress: Math.min(100, Math.round((value / d.target) * 100)),
    };
  });
  return { achievements, stats };
}

module.exports = { getAchievements, getStats };

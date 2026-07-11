const Goal = require("../models/Goal");
const Assignment = require("../models/Assignment");
const User = require("../models/User");
const { sendEmail } = require("./email");
const { deadlineReminder } = require("./emailTemplates");

/**
 * Find goals/assignments due in the next 24h and email each owner a single
 * digest. Users who turned off email notifications are skipped.
 */
async function sendUpcomingDeadlineEmails() {
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const [goals, assignments] = await Promise.all([
    Goal.find({ completed: false, targetDate: { $gte: now, $lte: in24h } })
      .select("userId title targetDate")
      .lean(),
    Assignment.find({ completed: false, deadline: { $gte: now, $lte: in24h } })
      .select("userId title deadline")
      .lean(),
  ]);

  const byUser = new Map();
  const push = (userId, item) => {
    const key = String(userId);
    if (!byUser.has(key)) byUser.set(key, []);
    byUser.get(key).push(item);
  };
  goals.forEach((g) => push(g.userId, { title: g.title, due: g.targetDate, type: "Goal" }));
  assignments.forEach((a) => push(a.userId, { title: a.title, due: a.deadline, type: "Assignment" }));

  let sent = 0;
  for (const [userId, items] of byUser) {
    const user = await User.findById(userId).select("name email notifyByEmail").lean();
    if (!user || user.notifyByEmail === false) continue;
    await sendEmail({
      to: user.email,
      subject: `You have ${items.length} deadline${items.length > 1 ? "s" : ""} coming up`,
      html: deadlineReminder(user.name, items),
    });
    sent += 1;
  }
  console.log(`[reminders] sent ${sent} deadline digest(s)`);
  return sent;
}

module.exports = { sendUpcomingDeadlineEmails };

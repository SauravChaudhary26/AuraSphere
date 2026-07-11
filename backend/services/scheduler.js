const cron = require("node-cron");
const { config } = require("../config");

/**
 * Registers recurring background jobs. Each job is wrapped so a failure never
 * crashes the process, and jobs that depend on optional integrations skip
 * cleanly when those aren't configured.
 */
function startSchedulers() {
  // Daily deadline reminders at 08:00 server time.
  cron.schedule("0 8 * * *", () => {
    runDeadlineReminders().catch((err) =>
      console.error("[scheduler] deadline reminders failed:", err.message)
    );
  });

  // Refresh the leaderboard snapshot every 5 minutes.
  cron.schedule("*/5 * * * *", () => {
    refreshLeaderboard().catch((err) =>
      console.error("[scheduler] leaderboard refresh failed:", err.message)
    );
  });

  console.log(
    `[scheduler] started (email reminders ${config.email.enabled ? "on" : "off — set RESEND_API_KEY"})`
  );
}

async function runDeadlineReminders() {
  if (!config.email.enabled) return;
  const { sendUpcomingDeadlineEmails } = require("./deadlineReminders");
  await sendUpcomingDeadlineEmails();
}

async function refreshLeaderboard() {
  const { rebuildLeaderboard } = require("./leaderboardService");
  await rebuildLeaderboard();
}

module.exports = { startSchedulers };

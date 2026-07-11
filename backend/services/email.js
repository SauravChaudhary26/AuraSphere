const { Resend } = require("resend");
const { config } = require("../config");

let client = null;
function getClient() {
  if (!config.email.enabled) return null;
  if (!client) client = new Resend(config.email.apiKey);
  return client;
}

/**
 * Send an email via Resend. Safe no-op (logs a warning) when RESEND_API_KEY is
 * not configured, so the app runs fully in dev without an email provider.
 */
async function sendEmail({ to, subject, html, text }) {
  const resend = getClient();
  if (!resend) {
    console.warn(`[email] skipped "${subject}" -> ${to} (RESEND_API_KEY not set)`);
    return { skipped: true };
  }
  try {
    const { data, error } = await resend.emails.send({
      from: config.email.from,
      to,
      subject,
      html,
      text,
    });
    if (error) throw new Error(error.message || "Resend error");
    return { id: data?.id };
  } catch (err) {
    console.error(`[email] failed "${subject}" -> ${to}:`, err.message);
    return { error: err.message };
  }
}

module.exports = { sendEmail };

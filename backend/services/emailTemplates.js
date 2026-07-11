const { config } = require("../config");

const shell = (title, body) => `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#1e1b3a">
    <div style="font-size:22px;font-weight:800;background:linear-gradient(90deg,#7c5cff,#22d3ee);-webkit-background-clip:text;background-clip:text;color:transparent;margin-bottom:16px">AuraSphere</div>
    <div style="background:#ffffff;border:1px solid #eee;border-radius:16px;padding:24px">
      <h1 style="font-size:18px;margin:0 0 12px">${title}</h1>
      ${body}
    </div>
    <p style="color:#8b8aa7;font-size:12px;margin-top:16px">You're receiving this because you have an AuraSphere account.</p>
  </div>`;

const button = (href, label) =>
  `<a href="${href}" style="display:inline-block;background:#7c5cff;color:#fff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:600">${label}</a>`;

exports.passwordReset = (name, resetUrl) =>
  shell(
    "Reset your password",
    `<p>Hi ${name || "there"},</p>
     <p>We received a request to reset your AuraSphere password. This link expires in 30 minutes.</p>
     <p style="margin:20px 0">${button(resetUrl, "Reset password")}</p>
     <p style="color:#8b8aa7;font-size:13px">If you didn't request this, you can safely ignore this email.</p>`
  );

exports.deadlineReminder = (name, items) =>
  shell(
    "Upcoming deadlines",
    `<p>Hi ${name || "there"}, here's what's due soon:</p>
     <ul style="padding-left:18px">
       ${items
         .map(
           (i) =>
             `<li style="margin:6px 0"><strong>${i.title}</strong> — due ${new Date(
               i.due
             ).toLocaleString()} <span style="color:#8b8aa7">(${i.type})</span></li>`
         )
         .join("")}
     </ul>
     <p style="margin:20px 0">${button(`${config.clientUrl}/dashboard`, "Open AuraSphere")}</p>`
  );

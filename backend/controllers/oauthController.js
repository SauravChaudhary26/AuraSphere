const axios = require("axios");
const User = require("../models/User");
const { signToken } = require("../utils/token");
const { config } = require("../config");

// After a successful OAuth callback we bounce back to the SPA with the token
// in the query; the frontend /oauth route stores it. On failure we send an
// error code the login page can surface.
const successRedirect = (res, user) => {
  const token = signToken(user);
  const url = `${config.clientUrl}/oauth?token=${encodeURIComponent(token)}&name=${encodeURIComponent(user.name)}&userId=${user._id}`;
  res.redirect(url);
};
const failRedirect = (res, code) => res.redirect(`${config.clientUrl}/login?error=${code}`);

const findOrCreate = async ({ email, name, providerField, providerId, avatar }) => {
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({ name: name || email.split("@")[0], email, [providerField]: providerId, avatar });
  } else if (!user[providerField]) {
    user[providerField] = providerId;
    if (!user.avatar && avatar) user.avatar = avatar;
    await user.save();
  }
  return user;
};

/* ------------------------------------------------------------------- GitHub */
const githubStart = (req, res) => {
  if (!config.github.enabled) return failRedirect(res, "github_not_configured");
  const params = new URLSearchParams({
    client_id: config.github.clientId,
    redirect_uri: `${config.appUrl}/auth/github/callback`,
    scope: "read:user user:email",
    allow_signup: "true",
  });
  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
};

const githubCallback = async (req, res) => {
  if (!config.github.enabled) return failRedirect(res, "github_not_configured");
  try {
    const { code } = req.query;
    if (!code) return failRedirect(res, "github_no_code");

    const { data: tokenRes } = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: config.github.clientId,
        client_secret: config.github.clientSecret,
        code,
        redirect_uri: `${config.appUrl}/auth/github/callback`,
      },
      { headers: { Accept: "application/json" } }
    );
    const accessToken = tokenRes.access_token;
    if (!accessToken) return failRedirect(res, "github_token");

    const gh = { headers: { Authorization: `Bearer ${accessToken}`, "User-Agent": "AuraSphere" } };
    const [{ data: profile }, { data: emails }] = await Promise.all([
      axios.get("https://api.github.com/user", gh),
      axios.get("https://api.github.com/user/emails", gh).catch(() => ({ data: [] })),
    ]);
    const email = (emails.find((e) => e.primary && e.verified) || emails[0])?.email || profile.email;
    if (!email) return failRedirect(res, "github_no_email");

    const user = await findOrCreate({
      email: email.toLowerCase(),
      name: profile.name || profile.login,
      providerField: "githubId",
      providerId: String(profile.id),
      avatar: profile.avatar_url,
    });
    successRedirect(res, user);
  } catch (err) {
    console.error("[oauth] github:", err.message);
    failRedirect(res, "github_failed");
  }
};

/* ----------------------------------------------------------------- Facebook */
const facebookStart = (req, res) => {
  if (!config.facebook.enabled) return failRedirect(res, "facebook_not_configured");
  const params = new URLSearchParams({
    client_id: config.facebook.appId,
    redirect_uri: `${config.appUrl}/auth/facebook/callback`,
    scope: "email,public_profile",
  });
  res.redirect(`https://www.facebook.com/v19.0/dialog/oauth?${params}`);
};

const facebookCallback = async (req, res) => {
  if (!config.facebook.enabled) return failRedirect(res, "facebook_not_configured");
  try {
    const { code } = req.query;
    if (!code) return failRedirect(res, "facebook_no_code");

    const { data: tokenRes } = await axios.get("https://graph.facebook.com/v19.0/oauth/access_token", {
      params: {
        client_id: config.facebook.appId,
        client_secret: config.facebook.appSecret,
        redirect_uri: `${config.appUrl}/auth/facebook/callback`,
        code,
      },
    });
    const accessToken = tokenRes.access_token;
    if (!accessToken) return failRedirect(res, "facebook_token");

    const { data: profile } = await axios.get("https://graph.facebook.com/me", {
      params: { fields: "id,name,email,picture", access_token: accessToken },
    });
    if (!profile.email) return failRedirect(res, "facebook_no_email");

    const user = await findOrCreate({
      email: profile.email.toLowerCase(),
      name: profile.name,
      providerField: "facebookId",
      providerId: String(profile.id),
      avatar: profile.picture?.data?.url,
    });
    successRedirect(res, user);
  } catch (err) {
    console.error("[oauth] facebook:", err.message);
    failRedirect(res, "facebook_failed");
  }
};

module.exports = { githubStart, githubCallback, facebookStart, facebookCallback };

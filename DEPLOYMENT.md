# Deployment & Security Guide

AuraSphere runs as three pieces: **frontend on Vercel**, **backend on Render**, **database on MongoDB Atlas**.

---

## 🔴 FIRST: rotate the exposed credentials (required)

An earlier `backend/.env` in this repo's history contained **live** secrets, including a JWT secret set to a guessable word. Treat all of these as compromised and rotate them before launch:

| Secret | Where to rotate |
|---|---|
| `JWT_SECRET` | Generate a new one: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`. Rotating it logs everyone out (expected). |
| MongoDB Atlas password | Atlas → Database Access → edit user → new password → update `MONGO_CONN`. |
| Google OAuth client secret | Google Cloud Console → Credentials → reset secret. |
| Cloudinary secret | Cloudinary dashboard → regenerate. |
| `CRON_SECRET` | Any new random string. |

Never commit `.env`. It is gitignored; keep it that way and set values in each host's dashboard.

---

## Backend — Render

1. New **Web Service** from the repo, root `backend/`.
2. Build: `npm ci` · Start: `npm start` · Health check path: `/health`.
3. Environment variables (see `backend/.env.example`): `NODE_ENV=production`, `MONGO_CONN`, `JWT_SECRET`, `CLIENT_URL` (your Vercel URL — this is also the CORS allow-list), `APP_URL` (this service's URL), `CRON_SECRET`, and any optional integration keys.
4. **Leaderboard refresh** runs in-process every 5 min; you can also trigger it externally:
   `curl -X GET $APP_URL/cron/leaderboard -H "x-cron-secret: $CRON_SECRET"` (e.g. a Render Cron Job).

## Frontend — Vercel

1. Import the repo, root directory `frontend/`, **Framework preset: Vite** (output `dist`).
2. Environment variables: `VITE_API_URL` and `VITE_SOCKET_URL` = your Render URL; `VITE_GOOGLE_CLIENT_ID` if using Google.
3. Deploy. Vercel serves the SPA; client routing is handled by the router.

## Database — Atlas

- Restrict network access to Render's egress (or 0.0.0.0/0 only if you must), use a strong DB password, and keep the connection string only in Render's env.

---

## Optional integrations

Each is off until its keys are set; the app runs without them.

- **Email (Resend):** set `RESEND_API_KEY` + `EMAIL_FROM`. Enables real password reset and daily deadline reminders.
- **Google login:** `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (backend) + `VITE_GOOGLE_CLIENT_ID` (frontend).
- **GitHub login:** create an OAuth app; callback `>{APP_URL}/auth/github/callback`; set `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`.
- **Facebook login:** create an app; redirect `>{APP_URL}/auth/facebook/callback`; set `FACEBOOK_APP_ID` / `FACEBOOK_APP_SECRET`.

---

## Notes on scale

Study-room state is held in the backend process (fine for one Render instance). To run multiple instances, add the Socket.IO Redis adapter and move room state to Redis — the socket layer is isolated in `backend/sockets/studyRoom.js` to make that swap localized.

# AuraSphere 🎓✨

**Turn focus into Aura.** AuraSphere is a student academic-engagement platform: set goals, manage courses, build a color-coded timetable, track attendance, run Pomodoro study rooms, challenge friends, and climb a campus leaderboard — all gamified with **Aura points**.

- **Frontend:** React 18 + Vite + Tailwind (custom design system, light & dark)
- **Backend:** Node/Express + MongoDB (Mongoose) + Socket.IO
- **Auth:** JWT + Google / GitHub / Facebook OAuth
- **Email:** Resend (password reset + deadline reminders)

---

## ✨ Features

- **Goals & Aura** — complete goals to earn Aura; every change is recorded in a server-side ledger.
- **Aura Store & Achievements** — spend Aura on power-ups/cosmetics; unlock achievements derived from real activity.
- **Courses & color-coded timetable** — organize courses and lay them out across the week.
- **Attendance** — mark present/absent per course with running percentage stats.
- **Assignments** — deadlines with completion rewards.
- **Study rooms** — authenticated, real-time Pomodoro sessions over Socket.IO.
- **Friend challenges** — dare a real user to a goal; completing it awards Aura.
- **Leaderboard** — all-time, weekly, and daily, with your own rank.
- **Events & exam countdown** — live countdowns to what matters.
- **Notifications** — email deadline reminders (opt-in).

---

## 🚀 Local development

**Prerequisites:** Node 18+ and a MongoDB (local `mongod`, Docker, or an Atlas URI).

```bash
# 1. MongoDB (Docker example)
docker run -d --name aurasphere-mongo -p 27017:27017 mongo:7

# 2. Backend
cd backend
cp .env.example .env          # then edit: set MONGO_CONN + a strong JWT_SECRET
npm install
npm run dev                   # http://localhost:8080  (health: /health)

# 3. Frontend (new terminal)
cd frontend
cp .env.example .env          # VITE_API_URL should point at the backend
npm install
npm run dev                   # http://localhost:3000
```

Generate a strong secret:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Environment variables are documented in [`backend/.env.example`](backend/.env.example) and [`frontend/.env.example`](frontend/.env.example). Optional integrations (email, GitHub/Facebook login) stay disabled until you add their keys — the app runs fully without them.

---

## 🧪 Tests

```bash
cd backend && npm test        # Jest + Supertest (API health)
```

---

## 📦 Deployment

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for the full guide (Vercel + Render + Atlas) and the **required secret-rotation checklist**.

---

## 🔒 Security

Auth uses short-lived JWTs; passwords are bcrypt-hashed and never returned. The API applies Helmet, per-route rate limiting, CORS allow-listing, input sanitization, and role-gated admin endpoints. **If you cloned this from an earlier version, rotate every credential — see DEPLOYMENT.md.**

## 📜 License

MIT.

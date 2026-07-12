import { Link } from "react-router-dom";
import {
  Target, CalendarDays, ClipboardCheck, Timer, Trophy, Swords,
  Sparkles, ArrowRight, Check, Flame, Zap, Gift, Store,
} from "lucide-react";
import Logo from "../components/Logo";
import AuraRing from "../components/ui/AuraRing";
import { Button, ThemeToggle } from "../components/ui";

const FEATURES = [
  { icon: Target, title: "Goals that pay off", body: "Set study goals and earn Aura the moment you finish them." },
  { icon: CalendarDays, title: "Color-coded timetable", body: "Build your weekly schedule from your courses, at a glance." },
  { icon: ClipboardCheck, title: "Attendance tracking", body: "Log classes and watch your attendance percentage per course." },
  { icon: Timer, title: "Pomodoro study rooms", body: "Live rooms with shared timers, video, chat and ambient sound." },
  { icon: Trophy, title: "Campus leaderboard", body: "See where you rank and climb with every bit of focused work." },
  { icon: Swords, title: "Challenge friends", body: "Dare a friend to a study goal and earn Aura for finishing." },
];

const STATS = [
  { value: "25 min", label: "of focus = +20 Aura" },
  { value: "6", label: "ways to earn every day" },
  { value: "15+", label: "rewards in the Aura Store" },
  { value: "1", label: "leaderboard to rule them all" },
];

const STEPS = [
  { n: "01", title: "Set your targets", body: "Add goals, assignments and your class timetable in minutes." },
  { n: "02", title: "Do the work", body: "Finish tasks and lock in with friends in live Pomodoro study rooms." },
  { n: "03", title: "Earn & flex", body: "Stack Aura, keep your streak, climb the board — then spend it on themes, frames and mystery boxes." },
];

/* Floating "you earned something" chips around the hero card. */
function FloatChip({ className, delay, children }) {
  return (
    <span
      className={`animate-bob absolute z-10 hidden items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-bold shadow-card md:inline-flex ${className}`}
      style={{ animationDelay: delay }}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-ground text-ink">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-border bg-ground/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Logo size={28} />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/login" className="hidden text-sm font-semibold text-muted hover:text-ink sm:block">Sign in</Link>
            <Link to="/signup"><Button size="sm">Get started</Button></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        {/* Decorative layer */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="landing-grid-bg absolute inset-0" />
          <div className="landing-blob landing-blob-gold -top-24 left-[8%] h-[380px] w-[380px]" />
          <div className="landing-blob landing-blob-jade top-40 right-[4%] h-[320px] w-[320px]" />
        </div>

        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 py-16 lg:grid-cols-[1.1fr_.9fr] lg:py-24">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider"
              style={{ color: "var(--primary)", background: "color-mix(in srgb, var(--primary) 14%, transparent)" }}>
              <Sparkles size={13} /> Gamified student productivity
            </span>
            <h1 className="mt-5 text-5xl font-extrabold leading-[1.03] sm:text-7xl">
              Turn focus<br />into <span className="name-gradient">aura.</span>
            </h1>
            <p className="serif mt-5 max-w-md text-xl italic text-muted">
              A student platform where goals, classes, and study sessions earn you{" "}
              <span className="text-ink">Aura</span> — and a place on the campus leaderboard.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/signup"><Button size="lg">Start earning <ArrowRight size={18} /></Button></Link>
              <Link to="/login"><Button size="lg" variant="ghost">I have an account</Button></Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-muted">
              {["Free for students", "No credit card", "Works on mobile"].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5"><Check size={15} className="text-jade" /> {t}</span>
              ))}
            </div>
          </div>

          {/* Hero card with floating earn-chips */}
          <div className="relative flex justify-center">
            <FloatChip className="-top-4 left-2 lg:-left-6" delay="0s">
              <Target size={13} style={{ color: "var(--jade)" }} /> Goal complete
              <span className="mono text-primary">+10</span>
            </FloatChip>
            <FloatChip className="top-1/4 -right-2 lg:-right-8" delay="-2s">
              <Timer size={13} style={{ color: "var(--primary)" }} /> Focus session
              <span className="mono text-primary">+20</span>
            </FloatChip>
            <FloatChip className="-bottom-5 left-8" delay="-3.5s">
              <Flame size={13} style={{ color: "var(--warning)" }} /> 12-day streak
            </FloatChip>
            <FloatChip className="bottom-1/4 -left-4 lg:-left-12" delay="-1.2s">
              <Zap size={13} style={{ color: "var(--primary)" }} /> 2× Aura boost
            </FloatChip>

            <div className="landing-hero-card animate-bob card-surface p-8">
              <AuraRing value={72} size={240} label="Level 7" primary="1,240" sub="340 to level 8" />
              <div className="mt-6 flex items-center justify-between gap-4 text-sm">
                <div><div className="mono text-xl font-extrabold">92%</div><div className="text-muted">attendance</div></div>
                <div><div className="mono text-xl font-extrabold">#7</div><div className="text-muted">on campus</div></div>
                <div><div className="mono text-xl font-extrabold">5</div><div className="text-muted">day streak</div></div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats band */}
        <div className="relative border-y border-border bg-surface/60 backdrop-blur">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-5 py-8 text-center sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label}>
                <div className="mono text-2xl font-extrabold text-primary sm:text-3xl">{s.value}</div>
                <div className="mt-1 text-xs text-muted sm:text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="text-center text-3xl font-extrabold">How it works</h2>
        <p className="mx-auto mt-2 max-w-lg text-center text-muted">Three steps between you and a glowing aura ring.</p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="card-surface landing-lift relative overflow-hidden p-6">
              <span
                className="mono absolute -right-2 -top-5 text-[76px] font-extrabold leading-none opacity-10"
                aria-hidden="true"
              >
                {s.n}
              </span>
              <div className="mono text-sm font-bold text-primary">{s.n}</div>
              <h3 className="mt-2 text-lg font-bold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-5 py-8">
        <h2 className="text-center text-3xl font-extrabold">Everything you need to stay on track</h2>
        <p className="mx-auto mt-2 max-w-lg text-center text-muted">One place for goals, courses, attendance, focus sessions, and a little healthy competition.</p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card-surface landing-lift p-6">
              <span className="grid h-11 w-11 place-items-center rounded-xl"
                style={{ color: "var(--primary)", background: "color-mix(in srgb, var(--primary) 15%, transparent)" }}>
                <f.icon size={22} />
              </span>
              <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Store teaser */}
      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="card-surface landing-lift relative overflow-hidden p-8 sm:p-10">
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "linear-gradient(120deg, color-mix(in srgb, var(--primary) 9%, transparent), transparent 55%)" }}
            aria-hidden="true"
          />
          <div className="relative grid items-center gap-8 md:grid-cols-[1fr_auto]">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider"
                style={{ color: "var(--primary)", background: "color-mix(in srgb, var(--primary) 14%, transparent)" }}>
                <Store size={13} /> The Aura Store
              </span>
              <h2 className="mt-4 text-3xl font-extrabold">Earning is half the fun.<br />Spending is the other half.</h2>
              <p className="mt-3 max-w-md text-muted">
                Trade your Aura for exclusive themes, animated avatar frames, streak freezes,
                2× boosts — or gamble it on a Mystery Box.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 md:max-w-[260px]" aria-hidden="true">
              {[["🌙", "Midnight"], ["💫", "Aura Frame"], ["❄️", "Streak Freeze"], ["⚡", "2× Boost"], ["🎁", "Mystery Box"], ["✨", "Golden Name"]].map(([e, l], i) => (
                <span
                  key={l}
                  className="animate-bob inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-sm font-semibold shadow-card"
                  style={{ animationDelay: `${-i * 0.9}s` }}
                >
                  <span className="text-base">{e}</span> {l}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-4">
        <div className="card-surface relative flex flex-col items-center gap-5 overflow-hidden p-10 text-center"
          style={{ background: "linear-gradient(150deg, color-mix(in srgb, var(--primary) 12%, var(--surface)), var(--surface))" }}>
          <span className="landing-blob landing-blob-gold -top-20 left-1/2 h-56 w-56 -translate-x-1/2" aria-hidden="true" />
          <h2 className="relative text-3xl font-extrabold">Your next study session is worth Aura.</h2>
          <p className="relative max-w-md text-muted">Join the students turning everyday focus into momentum — and momentum into bragging rights.</p>
          <Link to="/signup" className="relative">
            <Button size="lg">Create your free account <ArrowRight size={18} /></Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-muted sm:flex-row">
          <Logo size={24} />
          <div className="flex gap-5">
            <Link to="/contact" className="hover:text-ink">Contact</Link>
            <Link to="/report-issue" className="hover:text-ink">Report an issue</Link>
            <Link to="/login" className="hover:text-ink">Sign in</Link>
          </div>
          <span>© {new Date().getFullYear()} AuraSphere</span>
        </div>
      </footer>
    </div>
  );
}

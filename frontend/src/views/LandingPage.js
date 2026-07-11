import { Link } from "react-router-dom";
import {
  Target, CalendarDays, ClipboardCheck, Timer, Trophy, Swords,
  Sparkles, ArrowRight, Check,
} from "lucide-react";
import Logo from "../components/Logo";
import AuraRing from "../components/ui/AuraRing";
import { Button, ThemeToggle } from "../components/ui";

const FEATURES = [
  { icon: Target, title: "Goals that pay off", body: "Set study goals and earn Aura the moment you finish them." },
  { icon: CalendarDays, title: "Color-coded timetable", body: "Build your weekly schedule from your courses, at a glance." },
  { icon: ClipboardCheck, title: "Attendance tracking", body: "Log classes and watch your attendance percentage per course." },
  { icon: Timer, title: "Pomodoro study rooms", body: "Focus alongside other students in shared timed sessions." },
  { icon: Trophy, title: "Campus leaderboard", body: "See where you rank and climb with every bit of focused work." },
  { icon: Swords, title: "Challenge friends", body: "Dare a friend to a study goal and earn Aura for finishing." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-ground text-ink">
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
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 lg:grid-cols-[1.1fr_.9fr] lg:py-24">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider"
            style={{ color: "var(--primary)", background: "color-mix(in srgb, var(--primary) 14%, transparent)" }}>
            <Sparkles size={13} /> Gamified student productivity
          </span>
          <h1 className="mt-5 text-5xl font-extrabold leading-[1.03] sm:text-6xl">Turn focus<br />into aura.</h1>
          <p className="serif mt-5 max-w-md text-xl italic text-muted">
            A student platform where goals, classes, and study sessions earn you <span className="text-ink">Aura</span> — and a place on the campus leaderboard.
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
        <div className="flex justify-center">
          <div className="card-surface p-8">
            <AuraRing value={72} size={240} label="Level 7" primary="1,240" sub="340 to level 8" />
            <div className="mt-6 flex items-center justify-between gap-4 text-sm">
              <div><div className="mono text-xl font-extrabold">92%</div><div className="text-muted">attendance</div></div>
              <div><div className="mono text-xl font-extrabold">#7</div><div className="text-muted">on campus</div></div>
              <div><div className="mono text-xl font-extrabold">5</div><div className="text-muted">day streak</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-5 py-12">
        <h2 className="text-center text-3xl font-extrabold">Everything you need to stay on track</h2>
        <p className="mx-auto mt-2 max-w-lg text-center text-muted">One place for goals, courses, attendance, focus sessions, and a little healthy competition.</p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card-surface p-6">
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

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="card-surface flex flex-col items-center gap-5 p-10 text-center"
          style={{ background: "linear-gradient(150deg, color-mix(in srgb, var(--primary) 10%, var(--surface)), var(--surface))" }}>
          <h2 className="text-3xl font-extrabold">Your next study session is worth Aura.</h2>
          <p className="max-w-md text-muted">Join thousands of students turning everyday focus into momentum.</p>
          <Link to="/signup"><Button size="lg">Create your free account <ArrowRight size={18} /></Button></Link>
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

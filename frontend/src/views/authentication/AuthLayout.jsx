import { Link } from "react-router-dom";
import Logo from "../../components/Logo";
import AuraRing from "../../components/ui/AuraRing";
import { ThemeToggle } from "../../components/ui";

/** Split-screen shell for all auth pages: brand/marketing panel + form card. */
export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen bg-ground lg:grid lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12"
        style={{ background: "linear-gradient(150deg, var(--surface-2), var(--ground))" }}>
        <Link to="/"><Logo size={30} /></Link>
        <div className="flex flex-col items-center gap-8">
          <AuraRing value={72} size={230} label="Level 7" primary="1,240" sub="Aura earned" />
          <p className="serif max-w-sm text-center text-2xl italic text-muted">
            You showed up today. <span className="text-ink">That's the whole trick.</span>
          </p>
        </div>
        <p className="text-sm text-faint">Turn focus into Aura — goals, study rooms, and a campus leaderboard.</p>
      </div>

      {/* Form panel */}
      <div className="flex min-h-screen flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Link to="/" className="lg:hidden"><Logo size={26} /></Link>
          <div className="ml-auto"><ThemeToggle /></div>
        </div>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <h1 className="text-[28px] font-extrabold">{title}</h1>
          {subtitle && <p className="mt-1.5 text-muted">{subtitle}</p>}
          <div className="mt-7">{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-muted">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

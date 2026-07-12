import { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, Sun, Moon, Inbox } from "lucide-react";

/* ----------------------------------------------------------------- utilities */
export const cx = (...c) => c.filter(Boolean).join(" ");

/* -------------------------------------------------------------------- Button */
const BTN_VARIANTS = {
  primary: "bg-primary text-on-primary hover:brightness-110 shadow-card",
  jade: "bg-jade text-white hover:brightness-110",
  ghost: "bg-surface text-ink border border-border hover:border-primary",
  subtle: "bg-surface-2 text-ink hover:bg-border",
  danger: "bg-danger text-white hover:brightness-110",
};
const BTN_SIZES = { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2.5 text-[15px]", lg: "px-5 py-3 text-base" };

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className,
  children,
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-[11px] font-semibold transition",
        "disabled:opacity-55 disabled:cursor-not-allowed active:translate-y-px",
        BTN_VARIANTS[variant],
        BTN_SIZES[size],
        className
      )}
      {...props}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
}

/* ---------------------------------------------------------------------- Card */
export function Card({ className, children, as: Tag = "div", ...props }) {
  return (
    <Tag className={cx("card-surface p-5", className)} {...props}>
      {children}
    </Tag>
  );
}

/* --------------------------------------------------------------------- Badge */
const BADGE_COLOR = {
  gold: "var(--primary)",
  jade: "var(--jade)",
  success: "var(--success)",
  warning: "var(--warning)",
  danger: "var(--danger)",
  neutral: "var(--muted)",
};
export function Badge({ variant = "neutral", dot = false, className, children }) {
  const color = BADGE_COLOR[variant] || BADGE_COLOR.neutral;
  return (
    <span
      className={cx("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", className)}
      style={{ color, background: `color-mix(in srgb, ${color} 15%, transparent)` }}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />}
      {children}
    </span>
  );
}

/* --------------------------------------------------------------------- Field */
export function Field({ label, error, hint, required, children }) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 flex items-center gap-1 text-[13px] font-semibold text-muted">
          {label} {required && <span className="text-danger">*</span>}
        </span>
      )}
      {children}
      {error ? (
        <span className="mt-1 block text-xs text-danger">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-faint">{hint}</span>
      ) : null}
    </label>
  );
}

const inputBase =
  "w-full rounded-[11px] border border-border bg-surface-2 px-3.5 py-2.5 text-[15px] text-ink " +
  "placeholder:text-faint outline-none transition focus:border-primary";

export const Input = ({ className, ...p }) => <input className={cx(inputBase, className)} {...p} />;
export const Textarea = ({ className, ...p }) => (
  <textarea className={cx(inputBase, "min-h-[96px] resize-y", className)} {...p} />
);
export const Select = ({ className, children, ...p }) => (
  <select className={cx(inputBase, "appearance-none", className)} {...p}>
    {children}
  </select>
);

/* ------------------------------------------------------------------ StatTile */
export function StatTile({ icon, label, value, delta, deltaTone = "muted", tone = "primary" }) {
  const toneColor = BADGE_COLOR[tone] || BADGE_COLOR.gold;
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted">
        {icon && (
          <span
            className="grid h-6 w-6 place-items-center rounded-lg text-[13px]"
            style={{ color: toneColor, background: `color-mix(in srgb, ${toneColor} 16%, transparent)` }}
          >
            {icon}
          </span>
        )}
        {label}
      </div>
      <div className="mono mt-2 text-[28px] font-extrabold leading-none">{value}</div>
      {delta != null && (
        <div
          className="mt-1 text-[13px]"
          style={{ color: deltaTone === "up" ? "var(--success)" : deltaTone === "down" ? "var(--danger)" : "var(--muted)" }}
        >
          {delta}
        </div>
      )}
    </Card>
  );
}

/* --------------------------------------------------------------- ProgressBar */
export function ProgressBar({ value = 0, tone = "var(--primary)", className }) {
  return (
    <div className={cx("h-2 w-full overflow-hidden rounded-full bg-surface-2", className)}>
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: tone }} />
    </div>
  );
}

/* -------------------------------------------------------------------- Avatar */
/* `frame` is an Aura Store cosmetic class (see lib/cosmetics.js), rendered as
   a gradient ring wrapper so it works for both image and initials avatars. */
export function Avatar({ name = "", src, size = 36, className, frame }) {
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";
  const core = src ? (
    <img src={src} alt={name} width={size} height={size} className={cx("rounded-full object-cover", !frame && className)} style={{ width: size, height: size }} />
  ) : (
    <span
      className={cx("grid place-items-center rounded-full border border-border bg-surface-2 font-bold text-muted", !frame && className)}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials}
    </span>
  );
  if (!frame) return core;
  return <span className={cx("avatar-frame shrink-0", frame, className)}>{core}</span>;
}

/* ---------------------------------------------------------------- PageHeader */
export function PageHeader({ eyebrow, title, subtitle, actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <div className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{eyebrow}</div>}
        <h1 className="mt-1 text-[26px] font-extrabold">{title}</h1>
        {subtitle && <p className="mt-1 text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

/* ------------------------------------------------------- feedback components */
export function Spinner({ size = 24, className }) {
  return <Loader2 size={size} className={cx("animate-spin text-primary", className)} />;
}

export function LoadingScreen({ label = "Loading…" }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-muted">
      <Spinner size={30} />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function EmptyState({ icon = <Inbox size={40} />, title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-14 text-center">
      <div className="mb-3 text-faint">{icon}</div>
      <div className="text-lg font-semibold">{title}</div>
      {subtitle && <div className="mt-1 max-w-sm text-sm text-muted">{subtitle}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* --------------------------------------------------------------------- Modal */
export function Modal({ open, onClose, title, children, footer, size = "md" }) {
  const onKey = useCallback((e) => e.key === "Escape" && onClose?.(), [onClose]);
  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onKey]);

  if (!open) return null;
  const maxW = size === "lg" ? "max-w-2xl" : size === "sm" ? "max-w-sm" : "max-w-lg";
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cx("flex max-h-[calc(100dvh-2rem)] w-full flex-col card-surface p-6", maxW)}
      >
        <div className="mb-4 flex shrink-0 items-center justify-between">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-1 text-muted hover:bg-surface-2 hover:text-ink">
            <X size={20} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        {footer && <div className="mt-6 flex shrink-0 justify-end gap-3">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}

/* ---------------------------------------------------------------------- Tabs */
export function Tabs({ tabs, active, onChange, className }) {
  return (
    <div className={cx("flex gap-1 rounded-xl bg-surface-2 p-1", className)}>
      {tabs.map(({ id, label, icon: Icon, badge }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange?.(id)}
          className={cx(
            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition",
            active === id ? "bg-surface text-ink shadow-card" : "text-muted hover:text-ink"
          )}
        >
          {Icon && <Icon size={15} />}
          {label}
          {badge ? (
            <span className="rounded-full bg-primary px-1.5 text-[10px] font-bold text-on-primary">{badge}</span>
          ) : null}
        </button>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------- Switch */
/* The knob is anchored with an explicit left-0 (never the static position —
   browsers compute that inconsistently for absolute children of flex items)
   and moves purely via translate-x. */
export function Switch({ checked, onChange, disabled, label, className }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={cx("inline-flex items-center gap-2.5", disabled && "cursor-not-allowed opacity-50", className)}
    >
      <span
        aria-hidden="true"
        className={cx(
          "relative h-6 w-11 shrink-0 rounded-full border transition-colors",
          checked ? "border-transparent bg-primary" : "border-border bg-surface-2"
        )}
      >
        <span
          className={cx(
            "absolute left-0.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 rounded-full bg-white shadow-card transition-transform duration-200",
            checked ? "translate-x-[22px]" : "translate-x-0"
          )}
        />
      </span>
      {label && <span className="text-left text-sm font-medium text-ink">{label}</span>}
    </button>
  );
}

/* --------------------------------------------------------------- ThemeToggle */
const DARK_THEMES = ["dark", "midnight", "terminal"]; // store themes count as their base mode
export function ThemeToggle({ className }) {
  const toggle = () => {
    const root = document.documentElement;
    const cur = root.getAttribute("data-theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = DARK_THEMES.includes(cur) ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch {}
  };
  const isDark = typeof document !== "undefined" && DARK_THEMES.includes(document.documentElement.getAttribute("data-theme"));
  return (
    <button
      onClick={toggle}
      aria-label="Toggle color theme"
      className={cx("grid h-9 w-9 place-items-center rounded-full border border-border bg-surface text-muted hover:text-ink hover:border-primary", className)}
    >
      {isDark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}

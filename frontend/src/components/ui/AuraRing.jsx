/**
 * The signature Aura Ring — a conic-gradient progress ring used as the level
 * indicator, study timer, and brand motif. `value` is a 0–100 percentage.
 */
export default function AuraRing({
  value = 0,
  size = 200,
  thickness = 22,
  label,
  primary,
  sub,
  color = "var(--primary-bright)",
  children,
}) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <div
        className="absolute inset-0 rounded-full transition-[background] duration-700"
        style={{
          background: `conic-gradient(${color} ${pct}%, var(--ring-track) 0)`,
          boxShadow: "var(--glow)",
        }}
      />
      <div
        className="absolute rounded-full border border-border bg-surface shadow-card flex flex-col items-center justify-center text-center"
        style={{ inset: thickness }}
      >
        {children ? (
          children
        ) : (
          <>
            {label && <div className="text-[13px] font-bold uppercase tracking-[0.14em] text-muted">{label}</div>}
            {primary != null && <div className="mono my-1 text-[clamp(28px,7vw,50px)] font-extrabold leading-none">{primary}</div>}
            {sub && <div className="text-[13px] text-muted">{sub}</div>}
          </>
        )}
      </div>
    </div>
  );
}

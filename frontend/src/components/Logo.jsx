export function LogoMark({ size = 28 }) {
  return (
    <span
      aria-hidden="true"
      className="relative inline-block flex-none rounded-full"
      style={{
        width: size,
        height: size,
        background: "conic-gradient(from -90deg, var(--primary-bright), var(--jade), var(--primary-bright))",
        boxShadow: "var(--glow)",
      }}
    >
      <span
        className="absolute rounded-full"
        style={{ inset: Math.max(3, size * 0.2), background: "var(--surface)" }}
      />
    </span>
  );
}

export default function Logo({ size = 28, className }) {
  return (
    <span className={`flex items-center gap-2.5 font-extrabold tracking-[-0.02em] ${className || ""}`} style={{ fontSize: size * 0.66 }}>
      <LogoMark size={size} />
      <span>
        Aura<span style={{ color: "var(--primary)" }}>Sphere</span>
      </span>
    </span>
  );
}

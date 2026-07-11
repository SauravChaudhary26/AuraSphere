/* Dependency-free canvas confetti. Colors come from the design tokens so it
   matches light/dark theme automatically. */

const COLOR_VARS = ["--primary", "--primary-bright", "--jade", "--success", "--warning"];
const DURATION_MS = 2200;
const MAX_ACTIVE = 3;

let activeCount = 0;

export function fireConfetti({ light = false } = {}) {
  if (typeof document === "undefined" || activeCount >= MAX_ACTIVE) return;

  const styles = getComputedStyle(document.documentElement);
  const colors = COLOR_VARS.map((v) => styles.getPropertyValue(v).trim()).filter(Boolean);
  if (!colors.length) return;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const width = window.innerWidth;
  const height = window.innerHeight;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.cssText =
    "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:50;";
  document.body.appendChild(canvas);
  ctx.scale(dpr, dpr);
  activeCount++;

  const count = light ? 40 : 130;
  const particles = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: -20 - Math.random() * height * 0.25,
    vx: (Math.random() - 0.5) * 6,
    vy: 2 + Math.random() * 5,
    gravity: 0.12 + Math.random() * 0.1,
    size: 5 + Math.random() * 6,
    rotation: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.3,
    color: colors[(Math.random() * colors.length) | 0],
    circle: Math.random() < 0.3,
  }));

  const start = performance.now();

  const tick = (now) => {
    const elapsed = now - start;
    if (elapsed >= DURATION_MS) {
      canvas.remove();
      activeCount--;
      return;
    }
    ctx.clearRect(0, 0, width, height);
    const fade = elapsed > DURATION_MS - 400 ? (DURATION_MS - elapsed) / 400 : 1;
    for (const p of particles) {
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.spin;
      ctx.save();
      ctx.globalAlpha = fade;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      if (p.circle) {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.size / 2, -p.size * 0.35, p.size, p.size * 0.7);
      }
      ctx.restore();
    }
    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

import { Avatar, cx } from "../ui";

const MEDALS = ["🥇", "🥈", "🥉"];

function MiniStat({ label, value }) {
  return (
    <div className="rounded-xl bg-surface-2 p-2.5 text-center">
      <div className="text-[10px] font-bold uppercase tracking-wide text-faint">{label}</div>
      <div className="mono mt-1 text-sm font-extrabold text-ink">{value}</div>
    </div>
  );
}

export default function StatsPanel({ participants, timer, auraEarned, mySocketId }) {
  const roomMinutes = participants.reduce((sum, p) => sum + (p.focusMinutes || 0), 0);
  const ranked = [...participants].sort(
    (a, b) => b.focusMinutes - a.focusMinutes || b.focusSessionsCompleted - a.focusSessionsCompleted
  );

  return (
    <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4">
      <div className="grid grid-cols-3 gap-2">
        <MiniStat label="Room focus" value={`${roomMinutes} min`} />
        <MiniStat label="Sessions" value={timer.focusCount} />
        <MiniStat label="My aura" value={`+${auraEarned}`} />
      </div>

      <section>
        <div className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">Leaderboard</div>
        <div className="space-y-1">
          {ranked.map((p, i) => {
            const isSelf = p.socketId === mySocketId;
            return (
              <div
                key={p.socketId}
                className={cx("flex items-center gap-2 rounded-lg px-2 py-1.5", isSelf && "bg-surface-2")}
              >
                <span className={cx("w-6 shrink-0 text-center", i < 3 ? "text-sm" : "mono text-xs text-faint")}>
                  {i < 3 ? MEDALS[i] : `#${i + 1}`}
                </span>
                <Avatar name={p.name || ""} src={p.avatar || undefined} size={24} className="shrink-0" />
                <span className={cx("min-w-0 truncate text-sm", isSelf ? "font-semibold text-primary" : "text-ink")}>
                  {p.name}
                  {isSelf && " (you)"}
                </span>
                <span className="mono ml-auto shrink-0 text-xs text-muted">
                  {p.focusMinutes} min · {p.focusSessionsCompleted}×
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {timer.phase === "focus" && (
        <div className="text-center text-sm text-muted">
          🔥 {participants.length} people locked in right now
        </div>
      )}
    </div>
  );
}

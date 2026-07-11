import AuraRing from "../ui/AuraRing";
import { Avatar, Badge, cx } from "../ui";

/** Seconds → m:ss */
const fmt = (secs) => {
  const s = Math.max(0, Math.floor(secs));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
};

const ringColor = (remaining) => {
  if (remaining <= 300) return "var(--danger)";
  if (remaining <= 600) return "var(--warning)";
  return "var(--primary-bright)";
};

/**
 * A single participant in the study room, drawn as an Aura Ring around their
 * avatar. Progress + colour are derived from the server-provided timestamps.
 */
const UserAvatar = ({ user, now = Date.now(), isCurrentUser = false }) => {
  const joinedAt = Number(user?.joinedAt) || now;
  const endsAt = Number(user?.endsAt) || now;
  const totalSecs = Math.max(1, (endsAt - joinedAt) / 1000);
  const remaining = Math.max(0, Math.floor((endsAt - now) / 1000));
  const pct = Math.min(100, Math.max(0, ((totalSecs - remaining) / totalSecs) * 100));

  return (
    <div
      className={cx(
        "flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition",
        isCurrentUser ? "border-primary bg-surface-2" : "border-border bg-surface hover:border-primary"
      )}
    >
      <AuraRing value={pct} size={96} thickness={8} color={ringColor(remaining)}>
        <Avatar name={user?.name} src={user?.avatar?.length > 2 ? user.avatar : undefined} size={60} />
      </AuraRing>

      <div className="w-full">
        <p className="truncate text-sm font-semibold text-ink" title={user?.name}>
          {user?.name || "Anonymous"}
        </p>
        <p className="mono mt-0.5 text-xs text-muted">{fmt(remaining)}</p>
      </div>

      {isCurrentUser && <Badge variant="gold">You</Badge>}
    </div>
  );
};

export default UserAvatar;

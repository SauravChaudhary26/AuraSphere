import { useState, useEffect } from "react";
import { Users, Wifi, WifiOff, Hash } from "lucide-react";
import AuraRing from "../ui/AuraRing";
import { Card, Badge, EmptyState } from "../ui";
import UserAvatar from "./UserAvatar";

/** Seconds → m:ss */
const fmt = (secs) => {
  const s = Math.max(0, Math.floor(secs));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
};

const timerColor = (remaining) => {
  if (remaining <= 300) return "var(--danger)";
  if (remaining <= 600) return "var(--warning)";
  return "var(--primary-bright)";
};

const timerTone = (remaining) => {
  if (remaining <= 300) return "danger";
  if (remaining <= 600) return "warning";
  return "jade";
};

/**
 * The active study session. Owns the 1-second countdown ticker and renders the
 * focus ring + the live participant grid.
 */
const StudyRoomInterface = ({
  roomId,
  endsAt,
  studyMinutes = 25,
  users = [],
  connected = true,
  mySocketId,
}) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const totalSecs = Math.max(1, studyMinutes * 60);
  const remaining = Math.max(0, Math.floor((endsAt - now) / 1000));
  const pct = Math.min(100, Math.max(0, ((totalSecs - remaining) / totalSecs) * 100));

  const others = users.filter((u) => (mySocketId ? u.socketId !== mySocketId : true));

  return (
    <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
      {/* Focus timer */}
      <Card className="flex flex-col items-center justify-center gap-4">
        <AuraRing
          value={pct}
          size={220}
          color={timerColor(remaining)}
          label="Focus"
          primary={fmt(remaining)}
          sub={remaining > 0 ? "remaining" : "time's up"}
        />
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Badge variant={timerTone(remaining)} dot>
            {remaining > 600 ? "In flow" : remaining > 300 ? "Wrapping up" : "Final stretch"}
          </Badge>
          {connected ? (
            <Badge variant="success" dot>
              <Wifi size={12} /> Connected
            </Badge>
          ) : (
            <Badge variant="warning" dot>
              <WifiOff size={12} /> Reconnecting…
            </Badge>
          )}
        </div>
        {roomId && (
          <div className="flex items-center gap-1 text-xs text-faint">
            <Hash size={12} />
            <span className="mono">{roomId}</span>
          </div>
        )}
      </Card>

      {/* Participants */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <Users size={18} className="text-primary" />
          <h2 className="text-lg font-bold">
            In the room{" "}
            <span className="font-normal text-muted">
              ({users.length} {users.length === 1 ? "person" : "people"})
            </span>
          </h2>
        </div>

        {others.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {others.map((u) => (
              <UserAvatar key={u.socketId || u.name} user={u} now={now} isCurrentUser={false} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Users size={40} />}
            title="Studying solo for now"
            subtitle="Others will appear here the moment they join your room."
          />
        )}
      </div>
    </div>
  );
};

export default StudyRoomInterface;

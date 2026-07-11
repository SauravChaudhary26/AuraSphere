import { useState, useEffect, useCallback } from "react";
import { Trophy, Crown } from "lucide-react";
import {
  PageHeader,
  Card,
  Avatar,
  Badge,
  LoadingScreen,
  EmptyState,
  cx,
} from "../components/ui";
import api from "../lib/http";
import { handleError } from "../utils/ToastMessages";

const PERIODS = [
  { key: "all", label: "All-time" },
  { key: "week", label: "This week" },
  { key: "day", label: "Today" },
];

const MEDALS = { 1: "🥇", 2: "🥈", 3: "🥉" };

function RankBadge({ rank }) {
  if (MEDALS[rank]) {
    return (
      <span className="grid h-9 w-9 place-items-center text-xl leading-none" aria-label={`Rank ${rank}`}>
        {MEDALS[rank]}
      </span>
    );
  }
  return (
    <span className="mono grid h-9 w-9 place-items-center text-sm font-bold text-muted" aria-label={`Rank ${rank}`}>
      {rank}
    </span>
  );
}

export default function Leaderboard() {
  const [period, setPeriod] = useState("all");
  const [top, setTop] = useState([]);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  const myId = typeof localStorage !== "undefined" ? localStorage.getItem("userId") : null;

  const load = useCallback(async (p) => {
    setLoading(true);
    try {
      const { data } = await api.get("/leaderboard", { params: { period: p } });
      setTop(Array.isArray(data?.top) ? data.top : []);
      setMe(data?.me ?? null);
    } catch (err) {
      handleError("Couldn't load the leaderboard");
      setTop([]);
      setMe(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(period); }, [load, period]);

  return (
    <>
      <PageHeader
        eyebrow="Rankings"
        title="Leaderboard"
        subtitle="See how your Aura stacks up across campus."
      />

      <div className="mb-6 inline-flex flex-wrap gap-1 rounded-[13px] border border-border bg-surface p-1" role="tablist" aria-label="Leaderboard period">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            role="tab"
            aria-selected={period === p.key}
            onClick={() => setPeriod(p.key)}
            className={cx(
              "rounded-[9px] px-4 py-2 text-sm font-semibold transition",
              period === p.key ? "bg-primary text-on-primary shadow-card" : "text-muted hover:text-ink"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {me && (
        <Card className="mb-6 flex items-center gap-4 border-primary/40" style={{ borderColor: "color-mix(in srgb, var(--primary) 45%, var(--border))" }}>
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-surface-2 text-primary">
            <Crown size={22} />
          </div>
          <Avatar name={me.name} src={me.avatar} size={44} />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold uppercase tracking-wide text-muted">Your rank</div>
            <div className="truncate text-lg font-bold">{me.name || "You"}</div>
          </div>
          <div className="text-right">
            <div className="mono text-2xl font-extrabold leading-none text-ink">
              {me.rank != null ? `#${me.rank}` : "—"}
            </div>
            <div className="mono mt-1 text-sm font-semibold text-primary">
              {Number(me.aura || 0).toLocaleString()} Aura
            </div>
          </div>
        </Card>
      )}

      {loading ? (
        <LoadingScreen label="Loading the leaderboard…" />
      ) : top.length === 0 ? (
        <EmptyState
          icon={<Trophy size={40} />}
          title="No rankings yet"
          subtitle="Earn Aura by completing goals and study sessions to climb the board."
        />
      ) : (
        <Card className="p-0">
          <ul className="divide-y divide-border">
            {top.map((row) => {
              const isMe = myId != null && String(row.id) === String(myId);
              return (
                <li
                  key={row.id ?? row.rank}
                  className={cx(
                    "flex items-center gap-4 px-4 py-3 sm:px-5",
                    isMe && "bg-surface-2"
                  )}
                >
                  <RankBadge rank={row.rank} />
                  <Avatar name={row.name} src={row.avatar} size={40} />
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <span className="truncate font-semibold text-ink">{row.name}</span>
                    {isMe && <Badge variant="gold">You</Badge>}
                  </div>
                  <span className="mono shrink-0 text-[15px] font-bold text-primary">
                    {Number(row.aura || 0).toLocaleString()}
                  </span>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </>
  );
}

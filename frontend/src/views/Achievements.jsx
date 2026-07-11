import { useState, useEffect, useCallback } from "react";
import { Target, Sparkles, Trophy, CalendarCheck, Lock, Award } from "lucide-react";
import {
  PageHeader,
  Card,
  Badge,
  StatTile,
  ProgressBar,
  EmptyState,
  LoadingScreen,
  cx,
} from "../components/ui";
import api from "../lib/http";
import { handleError } from "../utils/ToastMessages";

export default function Achievements() {
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState({
    goalsCompleted: 0,
    aura: 0,
    challengesCompleted: 0,
    attendancePresent: 0,
  });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/achievements");
      setAchievements(data?.achievements || []);
      if (data?.stats) setStats(data.stats);
    } catch (err) {
      handleError("Couldn't load your achievements");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <LoadingScreen label="Loading your achievements…" />;

  const unlockedCount = achievements.filter((a) => a.earned).length;

  return (
    <>
      <PageHeader
        eyebrow="Achievements"
        title="Achievements"
        subtitle={
          achievements.length
            ? `${unlockedCount} of ${achievements.length} unlocked`
            : "Earn Aura to unlock rewards."
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile
          icon={<Target size={14} />}
          label="Goals completed"
          value={Number(stats.goalsCompleted || 0).toLocaleString()}
          tone="jade"
        />
        <StatTile
          icon={<Sparkles size={14} />}
          label="Total Aura"
          value={Number(stats.aura || 0).toLocaleString()}
          tone="gold"
        />
        <StatTile
          icon={<Trophy size={14} />}
          label="Challenges won"
          value={Number(stats.challengesCompleted || 0).toLocaleString()}
          tone="warning"
        />
        <StatTile
          icon={<CalendarCheck size={14} />}
          label="Classes attended"
          value={Number(stats.attendancePresent || 0).toLocaleString()}
          tone="jade"
        />
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-bold">Badges</h2>
        {achievements.length === 0 ? (
          <EmptyState
            icon={<Award size={40} />}
            title="No achievements yet"
            subtitle="Complete goals, win challenges, and show up to class to start unlocking badges."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {achievements.map((a) => (
              <AchievementCard key={a.id} achievement={a} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function AchievementCard({ achievement }) {
  const { name, desc, icon, target, value, earned, progress } = achievement;
  const pct = Math.max(0, Math.min(100, Number(progress) || 0));
  const val = Number(value) || 0;
  const tgt = Number(target) || 0;

  return (
    <Card
      className={cx(
        "flex flex-col gap-3 transition",
        earned
          ? "border-primary shadow-[var(--glow)]"
          : "opacity-70 hover:opacity-100"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={cx(
            "grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-[30px] leading-none",
            earned ? "bg-surface-2" : "bg-surface-2 grayscale"
          )}
          aria-hidden="true"
        >
          {icon || "🏅"}
        </div>
        {earned ? (
          <Badge variant="gold" dot>
            Unlocked
          </Badge>
        ) : (
          <span
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-faint"
            aria-label="Locked"
          >
            <Lock size={13} /> Locked
          </span>
        )}
      </div>

      <div>
        <h3 className={cx("text-base font-bold", !earned && "text-muted")}>
          {name}
        </h3>
        {desc && <p className="mt-1 text-sm text-muted">{desc}</p>}
      </div>

      {!earned && (
        <div className="mt-auto space-y-1.5">
          <ProgressBar value={pct} />
          <div className="mono flex items-center justify-between text-xs text-faint">
            <span>
              {val.toLocaleString()}/{tgt.toLocaleString()}
            </span>
            <span>{pct}%</span>
          </div>
        </div>
      )}
    </Card>
  );
}

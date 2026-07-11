import { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { Plus, Target, Sparkles, Trophy, CalendarClock } from "lucide-react";
import { PageHeader, Button, Card, StatTile, EmptyState, LoadingScreen } from "../components/ui";
import AuraRing from "../components/ui/AuraRing";
import GoalCard from "../components/Objectives/GoalCard";
import GoalFormModal from "../components/Objectives/GoalFormModal";
import api from "../lib/http";
import { useAuth } from "../contexts/AuthContext";
import { fetchPoints } from "../utils/redux/pointsSlice";
import { levelFromAura } from "../utils/aura";
import { handleError, handleSuccess } from "../utils/ToastMessages";

export default function Dashboard() {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [summary, setSummary] = useState({ total: 0, today: 0, week: 0 });
  const [rank, setRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    try {
      const [g, s, lb] = await Promise.allSettled([
        api.get("/goals"),
        api.get("/points/summary"),
        api.get("/leaderboard"),
      ]);
      if (g.status === "fulfilled") setGoals(g.value.data);
      if (s.status === "fulfilled") setSummary(s.value.data);
      if (lb.status === "fulfilled") setRank(lb.value.data?.me?.rank ?? null);
    } catch (err) {
      handleError("Couldn't load your dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const refreshAura = () => {
    dispatch(fetchPoints());
    api.get("/points/summary").then((r) => setSummary(r.data)).catch(() => {});
  };

  const addGoal = async (vals) => {
    try {
      await api.post("/goals", vals);
      handleSuccess("Goal added");
      load();
    } catch (err) { handleError(err?.response?.data?.message || "Couldn't add goal"); }
  };

  const editGoal = async (id, vals) => {
    try {
      await api.put(`/goals/${id}`, vals);
      handleSuccess("Goal updated");
      load();
    } catch (err) { handleError("Couldn't update goal"); }
  };

  const completeGoal = async (id) => {
    setGoals((gs) => gs.filter((g) => g._id !== id));
    try {
      const { data } = await api.patch(`/goals/${id}/complete`);
      if (data.awarded) handleSuccess(`Goal complete! +${data.awarded} Aura`);
      refreshAura();
    } catch (err) { handleError("Couldn't complete goal"); load(); }
  };

  const deleteGoal = async (id) => {
    setGoals((gs) => gs.filter((g) => g._id !== id));
    try { await api.delete(`/goals/${id}`); } catch (err) { handleError("Couldn't delete goal"); load(); }
  };

  const pinGoal = async (id) => {
    try { await api.patch("/goals/pin", { goalId: id }); load(); } catch (err) { handleError("Couldn't pin goal"); }
  };

  if (loading) return <LoadingScreen label="Loading your dashboard…" />;

  const { level, pct, toNext } = levelFromAura(summary.total);
  const firstName = (user?.name || "there").split(" ")[0];

  return (
    <>
      <PageHeader
        eyebrow="Dashboard"
        title={`Welcome back, ${firstName}`}
        subtitle="Here's your focus at a glance."
        actions={<Button onClick={() => setAdding(true)}><Plus size={17} /> New goal</Button>}
      />

      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        <Card className="flex flex-col items-center justify-center">
          <AuraRing value={pct} size={200} label={`Level ${level}`} primary={Number(summary.total).toLocaleString()} sub={`${toNext} to level ${level + 1}`} />
          <div className="mt-4 text-sm text-muted">Total Aura</div>
        </Card>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-2">
          <StatTile icon={<Sparkles size={14} />} label="Earned today" value={`+${summary.today}`} tone="gold" delta="this session counts" deltaTone="up" />
          <StatTile icon={<Target size={14} />} label="Active goals" value={goals.length} tone="jade" />
          <StatTile icon={<Trophy size={14} />} label="Campus rank" value={rank ? `#${rank}` : "—"} tone="warning" />
          <StatTile icon={<CalendarClock size={14} />} label="This week" value={`+${summary.week}`} tone="jade" />
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-bold">Active goals</h2>
        {goals.length === 0 ? (
          <EmptyState
            icon={<Target size={40} />}
            title="No goals yet"
            subtitle="Set your first goal and start earning Aura for finishing it."
            action={<Button onClick={() => setAdding(true)}><Plus size={16} /> Add a goal</Button>}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {goals.map((goal) => (
              <GoalCard key={goal._id} goal={goal} onComplete={completeGoal} onDelete={deleteGoal} onPin={pinGoal} onEdit={editGoal} />
            ))}
          </div>
        )}
      </div>

      {adding && <GoalFormModal open={adding} onClose={() => setAdding(false)} onSubmit={addGoal} />}
    </>
  );
}

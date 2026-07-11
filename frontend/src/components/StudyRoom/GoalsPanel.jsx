import { useState } from "react";
import { Check, Plus, X } from "lucide-react";
import { Badge, Button, Input, cx } from "../ui";
import { fireConfetti } from "./confetti";

const MAX_GOALS = 5;

export default function GoalsPanel({ myGoals, onSetGoals, participants, myUserId }) {
  const [draft, setDraft] = useState("");

  const addGoal = () => {
    const text = draft.trim();
    if (!text || myGoals.length >= MAX_GOALS) return;
    onSetGoals([...myGoals, { id: `g-${Date.now()}-${myGoals.length}`, text, done: false }]);
    setDraft("");
  };

  const toggleGoal = (id) => {
    const next = myGoals.map((g) => (g.id === id ? { ...g, done: !g.done } : g));
    if (next.find((g) => g.id === id)?.done) fireConfetti({ light: true });
    onSetGoals(next);
  };

  const removeGoal = (id) => onSetGoals(myGoals.filter((g) => g.id !== id));

  const others = participants.filter((p) => p.userId !== myUserId && (p.goals?.length ?? 0) > 0);
  const nobodyHasGoals = myGoals.length === 0 && others.length === 0;

  return (
    <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4">
      <section>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wide text-muted">My session goals</span>
          <span className="text-xs text-faint">
            {myGoals.length}/{MAX_GOALS}
          </span>
        </div>

        <ul className="space-y-1.5">
          {myGoals.map((g) => (
            <li key={g.id} className="group flex items-center gap-2 rounded-lg bg-surface-2 px-2.5 py-2">
              <button
                type="button"
                onClick={() => toggleGoal(g.id)}
                aria-label={g.done ? "Mark goal as not done" : "Mark goal as done"}
                className={cx(
                  "grid h-5 w-5 shrink-0 place-items-center rounded-md border transition",
                  g.done ? "border-primary bg-primary text-on-primary" : "border-border bg-surface text-transparent hover:border-primary"
                )}
              >
                <Check size={12} />
              </button>
              <span className={cx("min-w-0 flex-1 break-words text-sm", g.done && "text-faint line-through")}>
                {g.text}
              </span>
              <button
                type="button"
                onClick={() => removeGoal(g.id)}
                aria-label="Remove goal"
                className="shrink-0 rounded p-0.5 text-faint opacity-0 transition hover:text-danger group-hover:opacity-100"
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>

        {myGoals.length < MAX_GOALS && (
          <div className="mt-2 flex items-center gap-2">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addGoal()}
              placeholder="Add a goal…"
              maxLength={100}
              aria-label="New goal"
              className="py-2 text-sm"
            />
            <Button size="sm" variant="subtle" className="shrink-0 px-2.5 py-2" onClick={addGoal} disabled={!draft.trim()} aria-label="Add goal">
              <Plus size={16} />
            </Button>
          </div>
        )}
      </section>

      <section className="border-t border-border pt-4">
        <div className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">Room goals</div>
        {nobodyHasGoals ? (
          <div className="rounded-xl border-2 border-dashed border-border px-3 py-6 text-center text-sm text-faint">
            Set 1-3 goals for this session — small targets, big focus
          </div>
        ) : others.length === 0 ? (
          <div className="text-sm text-faint">No one else has shared goals yet.</div>
        ) : (
          <div className="space-y-3">
            {others.map((p) => (
              <div key={p.socketId}>
                <div className="flex items-center gap-2">
                  <span className="min-w-0 truncate text-sm font-semibold">{p.name}</span>
                  <Badge variant="neutral" className="shrink-0 px-2 py-0.5">
                    {p.goals.filter((g) => g.done).length}/{p.goals.length}
                  </Badge>
                </div>
                <ul className="mt-1 space-y-0.5">
                  {p.goals.map((g) => (
                    <li key={g.id} className="flex items-center gap-1.5 text-sm text-muted">
                      <Check size={12} className={cx("shrink-0", g.done ? "text-success" : "text-faint opacity-30")} />
                      <span className={cx("min-w-0 break-words", g.done && "text-faint line-through")}>{g.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

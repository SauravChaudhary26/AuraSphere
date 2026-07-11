import { useState } from "react";
import { Pin, Pencil, Trash2, Check, Sparkles } from "lucide-react";
import { Card, Badge, Button } from "../ui";
import { formatDate, daysUntil } from "../../utils/aura";
import GoalFormModal from "./GoalFormModal";

export default function GoalCard({ goal, onComplete, onDelete, onPin, onEdit }) {
  const [editing, setEditing] = useState(false);
  const left = daysUntil(goal.targetDate);
  const dueTone = left == null ? "neutral" : left < 0 ? "danger" : left <= 1 ? "warning" : "jade";
  const dueText = left == null ? "" : left < 0 ? `${Math.abs(left)}d overdue` : left === 0 ? "Due today" : left === 1 ? "Due tomorrow" : `${left}d left`;

  return (
    <Card className="flex h-full flex-col">
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="font-bold leading-snug">{goal.title}</h3>
        <button
          onClick={() => onPin(goal._id)}
          aria-label={goal.isPinned ? "Unpin" : "Pin"}
          className={goal.isPinned ? "text-primary" : "text-faint hover:text-primary"}
        >
          <Pin size={17} fill={goal.isPinned ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="mb-2 flex items-center gap-2">
        <Badge variant={dueTone} dot>{dueText}</Badge>
        <span className="text-xs text-faint">{formatDate(goal.targetDate)}</span>
      </div>
      <p className="line-clamp-3 flex-1 text-sm text-muted">{goal.description}</p>
      <div className="mt-4 flex items-center justify-between">
        <Button size="sm" onClick={() => onComplete(goal._id)}>
          <Check size={15} /> Complete
          <span className="ml-1 inline-flex items-center gap-0.5 opacity-80"><Sparkles size={12} />10</span>
        </Button>
        <div className="flex items-center gap-1">
          <button onClick={() => setEditing(true)} aria-label="Edit" className="rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-jade">
            <Pencil size={16} />
          </button>
          <button onClick={() => onDelete(goal._id)} aria-label="Delete" className="rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-danger">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      {editing && (
        <GoalFormModal
          open={editing}
          onClose={() => setEditing(false)}
          initial={goal}
          onSubmit={(vals) => onEdit(goal._id, vals)}
        />
      )}
    </Card>
  );
}

import { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, Check, Trash2, ClipboardList, BookOpen } from "lucide-react";
import {
  PageHeader,
  Button,
  Card,
  Badge,
  Field,
  Input,
  Textarea,
  Select,
  EmptyState,
  LoadingScreen,
  Modal,
  cx,
} from "../components/ui";
import api from "../lib/http";
import { formatDate, daysUntil } from "../utils/aura";
import { handleError, handleSuccess } from "../utils/ToastMessages";

const EMPTY_FORM = { title: "", course: "", description: "", deadline: "" };

function dueBadge(assignment) {
  if (assignment.completed) return { variant: "success", label: "Completed" };
  const days = daysUntil(assignment.deadline);
  if (days == null) return { variant: "neutral", label: "No deadline" };
  if (days < 0) return { variant: "danger", label: `${Math.abs(days)}d overdue` };
  if (days === 0) return { variant: "warning", label: "Due today" };
  if (days === 1) return { variant: "warning", label: "Due tomorrow" };
  if (days <= 3) return { variant: "warning", label: `Due in ${days}d` };
  return { variant: "jade", label: `Due in ${days}d` };
}

function AssignmentRow({ assignment, courseColors, onToggle, onDelete, busy }) {
  const badge = dueBadge(assignment);
  const done = assignment.completed;
  const courseColor = courseColors?.[assignment.course];
  return (
    <Card className="flex items-start gap-4 p-4">
      <button
        onClick={() => onToggle(assignment)}
        disabled={busy}
        aria-label={done ? "Mark as not done" : "Mark complete"}
        aria-pressed={done}
        className={cx(
          "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg border transition",
          done
            ? "border-success bg-success text-white"
            : "border-border bg-surface-2 text-transparent hover:border-primary",
          busy && "opacity-55 cursor-not-allowed"
        )}
      >
        <Check size={15} />
      </button>

      <div className="min-w-0 flex-1">
        <div className={cx("font-semibold text-ink", done && "text-muted line-through")}>
          {assignment.title}
        </div>
        {assignment.description && (
          <p className={cx("mt-0.5 line-clamp-2 text-sm text-muted", done && "line-through")}>
            {assignment.description}
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {assignment.course && (
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
              style={{
                color: courseColor || "var(--muted)",
                background: `color-mix(in srgb, ${courseColor || "var(--muted)"} 15%, transparent)`,
              }}
            >
              <BookOpen size={12} />
              {assignment.course}
            </span>
          )}
          <Badge variant={badge.variant} dot>
            {badge.label}
          </Badge>
          {assignment.deadline && (
            <span className="text-xs text-faint">{formatDate(assignment.deadline)}</span>
          )}
        </div>
      </div>

      <button
        onClick={() => onDelete(assignment)}
        aria-label="Delete assignment"
        className="shrink-0 rounded-lg p-1.5 text-muted transition hover:bg-surface-2 hover:text-danger"
      >
        <Trash2 size={17} />
      </button>
    </Card>
  );
}

function Group({ title, tone, items, busyId, ...rowProps }) {
  if (items.length === 0) return null;
  return (
    <section className="mb-8">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-lg font-bold">{title}</h2>
        <Badge variant={tone}>{items.length}</Badge>
      </div>
      <div className="grid gap-3">
        {items.map((a) => (
          <AssignmentRow key={a._id} assignment={a} busy={busyId === a._id} {...rowProps} />
        ))}
      </div>
    </section>
  );
}

export default function Assignment() {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const load = useCallback(async () => {
    try {
      const [a, c] = await Promise.allSettled([api.get("/assignments"), api.get("/courses")]);
      if (a.status === "fulfilled") setAssignments(a.value.data || []);
      if (c.status === "fulfilled") setCourses(c.value.data || []);
    } catch (err) {
      handleError("Couldn't load your assignments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const courseColors = useMemo(() => {
    const map = {};
    courses.forEach((c) => {
      if (c?.name) map[c.name] = c.color;
    });
    return map;
  }, [courses]);

  const groups = useMemo(() => {
    const overdue = [];
    const upcoming = [];
    const completed = [];
    for (const a of assignments) {
      if (a.completed) completed.push(a);
      else if (daysUntil(a.deadline) < 0) overdue.push(a);
      else upcoming.push(a);
    }
    return { overdue, upcoming, completed };
  }, [assignments]);

  const setField = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));

  const addAssignment = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.course) {
      handleError("Title and course are required");
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.post("/assignments", {
        title: form.title.trim(),
        course: form.course,
        description: form.description.trim(),
        deadline: form.deadline || null,
      });
      setAssignments((list) =>
        Array.isArray(data) ? data : [...list, data]
      );
      handleSuccess("Assignment added");
      setForm(EMPTY_FORM);
      setAdding(false);
    } catch (err) {
      handleError(err?.response?.data?.message || "Couldn't add assignment");
    } finally {
      setSaving(false);
    }
  };

  const toggleComplete = async (assignment) => {
    const id = assignment._id;
    const wasCompleted = assignment.completed;
    const next = !wasCompleted;
    setBusyId(id);
    setAssignments((list) =>
      list.map((a) => (a._id === id ? { ...a, completed: next } : a))
    );
    try {
      const { data } = await api.patch(`/assignments/${id}`, { completed: next });
      if (data && typeof data === "object") {
        setAssignments((list) => list.map((a) => (a._id === id ? { ...a, ...data } : a)));
      }
      if (data?.completed && !wasCompleted) handleSuccess("+15 Aura");
    } catch (err) {
      setAssignments((list) =>
        list.map((a) => (a._id === id ? { ...a, completed: wasCompleted } : a))
      );
      handleError("Couldn't update assignment");
    } finally {
      setBusyId(null);
    }
  };

  const deleteAssignment = async (assignment) => {
    const id = assignment._id;
    const prev = assignments;
    setAssignments((list) => list.filter((a) => a._id !== id));
    try {
      await api.delete(`/assignments/${id}`);
    } catch (err) {
      setAssignments(prev);
      handleError("Couldn't delete assignment");
    }
  };

  if (loading) return <LoadingScreen label="Loading your assignments…" />;

  const isEmpty = assignments.length === 0;

  return (
    <>
      <PageHeader
        eyebrow="Assignments"
        title="Your assignments"
        subtitle="Track deadlines and earn Aura for every one you finish."
        actions={
          <Button onClick={() => setAdding(true)}>
            <Plus size={17} /> Add assignment
          </Button>
        }
      />

      {isEmpty ? (
        <EmptyState
          icon={<ClipboardList size={40} />}
          title="No assignments yet"
          subtitle="Add your first assignment to start tracking deadlines and earning Aura."
          action={
            <Button onClick={() => setAdding(true)}>
              <Plus size={16} /> Add assignment
            </Button>
          }
        />
      ) : (
        <div>
          <Group
            title="Overdue"
            tone="danger"
            items={groups.overdue}
            courseColors={courseColors}
            onToggle={toggleComplete}
            onDelete={deleteAssignment}
            busyId={busyId}
          />
          <Group
            title="Upcoming"
            tone="jade"
            items={groups.upcoming}
            courseColors={courseColors}
            onToggle={toggleComplete}
            onDelete={deleteAssignment}
            busyId={busyId}
          />
          <Group
            title="Completed"
            tone="success"
            items={groups.completed}
            courseColors={courseColors}
            onToggle={toggleComplete}
            onDelete={deleteAssignment}
            busyId={busyId}
          />
        </div>
      )}

      <Modal
        open={adding}
        onClose={() => !saving && setAdding(false)}
        title="Add assignment"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAdding(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" form="assignment-form" loading={saving}>
              {saving ? "Saving…" : "Add assignment"}
            </Button>
          </>
        }
      >
        <form id="assignment-form" onSubmit={addAssignment} className="grid gap-4">
          <Field label="Title" required>
            <Input
              value={form.title}
              onChange={setField("title")}
              placeholder="e.g. Physics problem set 4"
              autoFocus
            />
          </Field>

          <Field label="Course" required>
            <Select value={form.course} onChange={setField("course")}>
              <option value="">Select a course…</option>
              {courses.map((c) => (
                <option key={c._id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Description">
            <Textarea
              value={form.description}
              onChange={setField("description")}
              placeholder="Optional details, requirements, links…"
            />
          </Field>

          <Field label="Deadline">
            <Input type="date" value={form.deadline} onChange={setField("deadline")} />
          </Field>
        </form>
      </Modal>
    </>
  );
}

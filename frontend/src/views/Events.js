import { useState, useEffect, useCallback } from "react";
import { Plus, CalendarClock, Trash2, GraduationCap, CalendarDays, Flag } from "lucide-react";
import {
  PageHeader,
  Button,
  Card,
  Badge,
  Field,
  Input,
  Select,
  Textarea,
  EmptyState,
  LoadingScreen,
  Modal,
  cx,
} from "../components/ui";
import api from "../lib/http";
import { formatDate } from "../utils/aura";
import { handleError, handleSuccess } from "../utils/ToastMessages";

/* Type metadata: icon, label, badge variant, and token color for accents. */
const TYPE_META = {
  exam: { label: "Exam", icon: GraduationCap, badge: "danger", color: "var(--danger)" },
  deadline: { label: "Deadline", icon: Flag, badge: "warning", color: "var(--warning)" },
  event: { label: "Event", icon: CalendarDays, badge: "jade", color: "var(--jade)" },
};

/* Preset color swatches for the modal (course/event colors). */
const SWATCHES = ["#E0A100", "#22A06B", "#E5484D", "#F5A623", "#4C6EF5", "#9C36B5", "#0CA5B0", "#6B7280"];

const EMPTY_FORM = { title: "", type: "exam", date: "", color: "", notes: "" };

/* Convert a stored ISO date into a value the datetime-local input accepts. */
function toLocalInput(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/* Build a human countdown string from a target date and the current time. */
function countdown(target, now) {
  const t = new Date(target).getTime();
  if (Number.isNaN(t)) return { passed: false, text: "—", parts: null };
  let diff = t - now;
  if (diff <= 0) return { passed: true, text: "Passed", parts: null };
  const sec = Math.floor(diff / 1000);
  const days = Math.floor(sec / 86400);
  const hours = Math.floor((sec % 86400) / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = sec % 60;
  return { passed: false, text: "", parts: { days, hours, minutes, seconds } };
}

function CountdownDisplay({ date, now }) {
  const { passed, parts } = countdown(date, now);
  if (passed) return <Badge variant="neutral">Passed</Badge>;
  const cells = [
    { v: parts.days, l: "days" },
    { v: parts.hours, l: "hrs" },
    { v: parts.minutes, l: "min" },
    { v: parts.seconds, l: "sec" },
  ];
  return (
    <div className="flex items-end gap-3">
      {cells.map((c) => (
        <div key={c.l} className="text-center">
          <div className="mono text-[26px] font-extrabold leading-none">{String(c.v).padStart(2, "0")}</div>
          <div className="mt-1 text-[11px] font-bold uppercase tracking-wide text-faint">{c.l}</div>
        </div>
      ))}
    </div>
  );
}

function EventCard({ event, now, onDelete }) {
  const meta = TYPE_META[event.type] || TYPE_META.event;
  const Icon = meta.icon;
  const accent = event.color || meta.color;
  const { passed } = countdown(event.date, now);
  return (
    <Card className={cx("relative flex flex-col gap-4", passed && "opacity-70")}>
      <span
        className="absolute left-0 top-0 h-full w-1 rounded-l-2xl"
        style={{ background: accent }}
        aria-hidden="true"
      />
      <div className="flex items-start justify-between gap-3 pl-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
              style={{ color: accent, background: `color-mix(in srgb, ${accent} 16%, transparent)` }}
            >
              <Icon size={16} />
            </span>
            <h3 className="truncate text-base font-bold">{event.title}</h3>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant={meta.badge}>{meta.label}</Badge>
            <span className="text-sm text-muted">{formatDate(event.date)}</span>
          </div>
        </div>
        <button
          onClick={() => onDelete(event._id)}
          aria-label={`Delete ${event.title}`}
          className="rounded-lg p-1.5 text-faint transition hover:bg-surface-2 hover:text-danger"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {event.notes && <p className="pl-2 text-sm text-muted">{event.notes}</p>}

      <div className="mt-auto border-t border-border pt-4 pl-2">
        <CountdownDisplay date={event.date} now={now} />
      </div>
    </Card>
  );
}

function EventFormModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm(EMPTY_FORM);
  }, [open]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date) {
      handleError("Title and date are required");
      return;
    }
    setSaving(true);
    try {
      await onSubmit({
        title: form.title.trim(),
        type: form.type,
        date: new Date(form.date).toISOString(),
        color: form.color || undefined,
        notes: form.notes.trim() || undefined,
      });
      onClose();
    } catch {
      /* error surfaced by caller */
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add event"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button onClick={submit} loading={saving} type="button">
            Add event
          </Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Title" required>
          <Input value={form.title} onChange={set("title")} placeholder="Calculus final exam" autoFocus />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Type" required>
            <Select value={form.type} onChange={set("type")}>
              <option value="exam">Exam</option>
              <option value="event">Event</option>
              <option value="deadline">Deadline</option>
            </Select>
          </Field>
          <Field label="Date &amp; time" required>
            <Input type="datetime-local" value={form.date} onChange={set("date")} />
          </Field>
        </div>

        <Field label="Color" hint="Optional — defaults to the type color">
          <div className="flex flex-wrap gap-2">
            {SWATCHES.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Choose color ${c}`}
                aria-pressed={form.color === c}
                onClick={() => setForm((f) => ({ ...f, color: f.color === c ? "" : c }))}
                className={cx(
                  "h-8 w-8 rounded-full border-2 transition",
                  form.color === c ? "border-ink scale-110" : "border-transparent hover:scale-105"
                )}
                style={{ background: c }}
              />
            ))}
          </div>
        </Field>

        <Field label="Notes">
          <Textarea value={form.notes} onChange={set("notes")} placeholder="Chapters 1–6, calculator allowed…" />
        </Field>
      </form>
    </Modal>
  );
}

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [now, setNow] = useState(Date.now());

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/events");
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      handleError("Couldn't load your events");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Live countdown tick — update every second, clear on unmount.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const addEvent = async (vals) => {
    try {
      const { data } = await api.post("/events", vals);
      setEvents((prev) =>
        [...prev, data].sort((a, b) => new Date(a.date) - new Date(b.date))
      );
      handleSuccess("Event added");
    } catch (err) {
      handleError(err?.response?.data?.message || "Couldn't add event");
      throw err;
    }
  };

  const deleteEvent = async (id) => {
    const prev = events;
    setEvents((es) => es.filter((e) => e._id !== id));
    try {
      await api.delete(`/events/${id}`);
    } catch (err) {
      handleError("Couldn't delete event");
      setEvents(prev);
    }
  };

  if (loading) return <LoadingScreen label="Loading your events…" />;

  return (
    <>
      <PageHeader
        eyebrow="Countdown"
        title="Events & exams"
        subtitle="Every deadline that matters, counting down live."
        actions={
          <Button onClick={() => setAdding(true)}>
            <Plus size={17} /> Add event
          </Button>
        }
      />

      {events.length === 0 ? (
        <EmptyState
          icon={<CalendarClock size={40} />}
          title="Nothing on the horizon"
          subtitle="Add your exams, deadlines, and events to see a live countdown to each one."
          action={
            <Button onClick={() => setAdding(true)}>
              <Plus size={16} /> Add event
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event._id} event={event} now={now} onDelete={deleteEvent} />
          ))}
        </div>
      )}

      <EventFormModal open={adding} onClose={() => setAdding(false)} onSubmit={addEvent} />
    </>
  );
}

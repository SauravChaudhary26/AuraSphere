import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Save, Trash2, CalendarDays, BookOpen } from "lucide-react";
import {
  PageHeader,
  Button,
  Card,
  Badge,
  Select,
  EmptyState,
  LoadingScreen,
} from "../components/ui";
import api from "../lib/http";
import { handleError, handleSuccess } from "../utils/ToastMessages";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const SLOTS = [
  "09:00-10:00",
  "10:00-11:00",
  "11:00-12:00",
  "12:00-13:00",
  "13:00-14:00",
  "14:00-15:00",
  "15:00-16:00",
  "16:00-17:00",
];

const emptySchedule = () => {
  const schedule = {};
  DAYS.forEach((day) => {
    schedule[day] = {};
    SLOTS.forEach((slot) => {
      schedule[day][slot] = null;
    });
  });
  return schedule;
};

// Merge whatever the API returns onto a full DAYS x SLOTS grid so every cell exists.
const normalize = (incoming = {}) => {
  const base = emptySchedule();
  DAYS.forEach((day) => {
    SLOTS.forEach((slot) => {
      const val = incoming?.[day]?.[slot];
      base[day][slot] = val || null;
    });
  });
  return base;
};

export default function Timetable() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [schedule, setSchedule] = useState(emptySchedule);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [c, t] = await Promise.allSettled([
        api.get("/courses"),
        api.get("/timetable"),
      ]);
      if (c.status === "fulfilled") setCourses(c.value.data || []);
      if (t.status === "fulfilled") {
        setSchedule(normalize(t.value.data?.schedule));
      } else {
        setSchedule(emptySchedule());
      }
      if (c.status === "rejected") handleError("Couldn't load your courses");
    } catch (err) {
      handleError("Couldn't load your timetable");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const courseById = (id) => courses.find((c) => c._id === id);

  const setCell = (day, slot, courseId) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], [slot]: courseId || null },
    }));
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.post("/timetable", { schedule });
      handleSuccess("Timetable saved");
    } catch (err) {
      handleError(err?.response?.data?.message || "Couldn't save timetable");
    } finally {
      setSaving(false);
    }
  };

  const clear = async () => {
    if (!window.confirm("Clear your entire timetable? This can't be undone.")) return;
    const snapshot = schedule;
    setSchedule(emptySchedule()); // optimistic
    setClearing(true);
    try {
      await api.delete("/timetable");
      handleSuccess("Timetable cleared");
    } catch (err) {
      setSchedule(snapshot); // rollback
      handleError("Couldn't clear timetable");
    } finally {
      setClearing(false);
    }
  };

  if (loading) return <LoadingScreen label="Loading your timetable…" />;

  const totalClasses = DAYS.reduce(
    (sum, day) => sum + SLOTS.filter((slot) => schedule[day]?.[slot]).length,
    0
  );

  return (
    <>
      <PageHeader
        eyebrow="Timetable"
        title="Weekly schedule"
        subtitle="Assign a course to each slot, then save your week."
        actions={
          <>
            <Button variant="ghost" onClick={clear} loading={clearing} disabled={saving}>
              <Trash2 size={16} /> Clear
            </Button>
            <Button onClick={save} loading={saving} disabled={clearing}>
              <Save size={16} /> Save
            </Button>
          </>
        }
      />

      {courses.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={40} />}
          title="No courses yet"
          subtitle="Add courses first — then you can drop them into your weekly timetable."
          action={
            <Button onClick={() => navigate("/courses")}>
              <BookOpen size={16} /> Add courses
            </Button>
          }
        />
      ) : (
        <>
          {/* Legend */}
          <Card className="mb-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted">
                <CalendarDays size={16} /> Courses
              </h2>
              <Badge variant="gold">{totalClasses} scheduled</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {courses.map((course) => (
                <span
                  key={course._id}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-sm font-medium text-ink"
                  style={{
                    background: `color-mix(in srgb, ${course.color} 12%, transparent)`,
                  }}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: course.color }}
                    aria-hidden="true"
                  />
                  {course.name}
                </span>
              ))}
            </div>
          </Card>

          {/* Grid */}
          <Card className="p-0">
            <div className="overflow-x-auto">
              <div className="min-w-[820px]">
                {/* Header row */}
                <div
                  className="grid border-b border-border"
                  style={{ gridTemplateColumns: "110px repeat(5, minmax(140px, 1fr))" }}
                >
                  <div className="mono px-3 py-3 text-xs font-bold uppercase tracking-wide text-faint">
                    Time
                  </div>
                  {DAYS.map((day) => (
                    <div
                      key={day}
                      className="px-3 py-3 text-center text-sm font-bold text-ink"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Slot rows */}
                {SLOTS.map((slot) => (
                  <div
                    key={slot}
                    className="grid border-b border-border last:border-b-0"
                    style={{ gridTemplateColumns: "110px repeat(5, minmax(140px, 1fr))" }}
                  >
                    <div className="mono flex items-center px-3 py-3 text-xs font-semibold text-muted">
                      {slot}
                    </div>
                    {DAYS.map((day) => {
                      const courseId = schedule[day]?.[slot] || "";
                      const course = courseId ? courseById(courseId) : null;
                      const color = course?.color;
                      return (
                        <div
                          key={`${day}-${slot}`}
                          className="border-l border-border p-2"
                          style={
                            color
                              ? {
                                  background: `color-mix(in srgb, ${color} 10%, transparent)`,
                                  borderLeft: `3px solid ${color}`,
                                }
                              : undefined
                          }
                        >
                          {/* The select IS the cell label — colored per course,
                              so nothing needs to repeat below it. */}
                          <Select
                            aria-label={`Course for ${day} ${slot}`}
                            title={course?.name}
                            value={courseId}
                            onChange={(e) => setCell(day, slot, e.target.value)}
                            className={course ? "py-2 text-sm font-semibold" : "py-2 text-sm text-faint"}
                            style={
                              color
                                ? {
                                    color,
                                    borderColor: `color-mix(in srgb, ${color} 45%, var(--border))`,
                                    background: "var(--surface)",
                                  }
                                : undefined
                            }
                          >
                            <option value="">—</option>
                            {courses.map((c) => (
                              <option key={c._id} value={c._id}>
                                {c.name}
                              </option>
                            ))}
                          </Select>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </>
      )}
    </>
  );
}

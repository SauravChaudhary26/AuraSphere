import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { CalendarCheck, CheckCircle2, XCircle, Trash2, CalendarDays, BookOpen } from "lucide-react";
import {
  PageHeader,
  Button,
  Card,
  Badge,
  Field,
  Input,
  StatTile,
  EmptyState,
  LoadingScreen,
  Spinner,
  cx,
} from "../components/ui";
import AuraRing from "../components/ui/AuraRing";
import api from "../lib/http";
import { formatDate } from "../utils/aura";
import { handleError, handleSuccess } from "../utils/ToastMessages";

const todayISO = () => new Date().toISOString().split("T")[0];

const isThisMonth = (input) => {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
};

export default function Attendance() {
  const [courses, setCourses] = useState([]);
  const [selected, setSelected] = useState("");
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0, percentage: 0 });
  const [date, setDate] = useState(todayISO());
  const [loading, setLoading] = useState(true);
  const [courseLoading, setCourseLoading] = useState(false);
  const [marking, setMarking] = useState(null); // 'present' | 'absent' | null

  // Initial: load courses
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await api.get("/courses");
        if (!alive) return;
        setCourses(data || []);
        if (data && data.length > 0) setSelected(data[0]._id);
      } catch (err) {
        handleError("Couldn't load your courses");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Load attendance list + stats for the selected course
  const loadCourse = useCallback(async (courseId) => {
    if (!courseId) return;
    setCourseLoading(true);
    try {
      const [list, st] = await Promise.allSettled([
        api.get(`/attendance/${courseId}`),
        api.get(`/attendance/${courseId}/stats`),
      ]);
      if (list.status === "fulfilled") setRecords(list.value.data || []);
      else handleError("Couldn't load attendance records");
      if (st.status === "fulfilled") setStats(st.value.data || { total: 0, present: 0, absent: 0, percentage: 0 });
    } catch (err) {
      handleError("Couldn't load attendance");
    } finally {
      setCourseLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!selected) {
      setRecords([]);
      setStats({ total: 0, present: 0, absent: 0, percentage: 0 });
      return;
    }
    loadCourse(selected);
  }, [selected, loadCourse]);

  const mark = async (status) => {
    if (!selected || !date || marking) return;
    setMarking(status);
    try {
      await api.post("/attendance", { courseId: selected, date, status });
      handleSuccess(`Marked ${status} for ${formatDate(date)}`);
      await loadCourse(selected);
    } catch (err) {
      handleError(err?.response?.data?.message || "Couldn't mark attendance");
    } finally {
      setMarking(null);
    }
  };

  const remove = async (id) => {
    const prev = records;
    setRecords((rs) => rs.filter((r) => r._id !== id));
    try {
      await api.delete(`/attendance/${id}`);
      // Keep the stat tiles / ring in sync with the server.
      api
        .get(`/attendance/${selected}/stats`)
        .then((r) => setStats(r.data))
        .catch(() => {});
    } catch (err) {
      handleError("Couldn't delete record");
      setRecords(prev);
    }
  };

  if (loading) return <LoadingScreen label="Loading attendance…" />;

  const selectedCourse = courses.find((c) => c._id === selected);
  const monthCount = records.filter((r) => isThisMonth(r.date)).length;

  return (
    <>
      <PageHeader
        eyebrow="Attendance"
        title="Attendance"
        subtitle="Track your class attendance and keep your streak strong."
      />

      {courses.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={40} />}
          title="No courses yet"
          subtitle="Add a course first, then start tracking attendance for it."
          action={
            <Link to="/courses">
              <Button>
                <BookOpen size={16} /> Go to Courses
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-6">
          {/* Course selector — chips */}
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Select a course">
            {courses.map((c) => {
              const active = c._id === selected;
              return (
                <button
                  key={c._id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelected(c._id)}
                  className={cx(
                    "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition",
                    active
                      ? "border-primary bg-surface text-ink"
                      : "border-border bg-surface text-muted hover:border-primary hover:text-ink"
                  )}
                >
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color || "var(--primary)" }} />
                  {c.name}
                </button>
              );
            })}
          </div>

          {/* Stats + ring */}
          <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
            <Card className="flex flex-col items-center justify-center">
              {courseLoading ? (
                <div className="grid h-[200px] w-[200px] place-items-center">
                  <Spinner size={28} />
                </div>
              ) : (
                <AuraRing
                  value={stats.percentage || 0}
                  size={200}
                  label="Attendance"
                  primary={`${stats.percentage || 0}%`}
                  sub={`${stats.present || 0}/${stats.total || 0} present`}
                />
              )}
              <div className="mt-4 text-sm text-muted">
                {selectedCourse?.name || "Selected course"}
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-2">
              <StatTile icon={<CheckCircle2 size={14} />} label="Present" value={stats.present || 0} tone="jade" />
              <StatTile icon={<XCircle size={14} />} label="Absent" value={stats.absent || 0} tone="danger" />
              <StatTile icon={<CalendarCheck size={14} />} label="Total classes" value={stats.total || 0} tone="gold" />
              <StatTile icon={<CalendarDays size={14} />} label="This month" value={monthCount} tone="warning" />
            </div>
          </div>

          {/* Mark attendance */}
          <Card>
            <h2 className="mb-4 text-lg font-bold">Mark attendance</h2>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="sm:w-56">
                <Field label="Date">
                  <Input type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} />
                </Field>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="jade"
                  loading={marking === "present"}
                  disabled={marking != null}
                  onClick={() => mark("present")}
                >
                  <CheckCircle2 size={17} /> Present
                </Button>
                <Button
                  variant="danger"
                  loading={marking === "absent"}
                  disabled={marking != null}
                  onClick={() => mark("absent")}
                >
                  <XCircle size={17} /> Absent
                </Button>
              </div>
            </div>
          </Card>

          {/* Recent records */}
          <div>
            <h2 className="mb-4 text-lg font-bold">Recent records</h2>
            {courseLoading ? (
              <div className="flex justify-center py-10">
                <Spinner size={26} />
              </div>
            ) : records.length === 0 ? (
              <EmptyState
                icon={<CalendarCheck size={40} />}
                title="No records yet"
                subtitle="Mark your attendance for today to start building your history."
              />
            ) : (
              <div className="flex flex-col gap-2.5">
                {records.map((r) => {
                  const present = r.status === "present";
                  return (
                    <Card key={r._id} className="flex items-center justify-between gap-3 p-4">
                      <div className="flex items-center gap-3">
                        {present ? (
                          <CheckCircle2 size={20} className="text-jade" />
                        ) : (
                          <XCircle size={20} className="text-danger" />
                        )}
                        <span className="font-semibold text-ink">{formatDate(r.date)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={present ? "jade" : "danger"} dot>
                          {present ? "Present" : "Absent"}
                        </Badge>
                        <button
                          onClick={() => remove(r._id)}
                          aria-label={`Delete attendance record for ${formatDate(r.date)}`}
                          className="rounded-lg p-1.5 text-faint transition hover:bg-surface-2 hover:text-danger"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

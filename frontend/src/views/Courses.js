import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, BookOpen } from "lucide-react";
import {
  PageHeader,
  Button,
  Card,
  Field,
  Input,
  EmptyState,
  LoadingScreen,
  Modal,
  cx,
} from "../components/ui";
import api from "../lib/http";
import { handleError, handleSuccess } from "../utils/ToastMessages";

const PRESET_COLORS = [
  "#E8B923", // gold
  "#3BA776", // jade
  "#3B82F6", // blue
  "#8B5CF6", // violet
  "#EC4899", // pink
  "#EF4444", // red
];

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/courses");
      setCourses(data);
    } catch (err) {
      handleError("Couldn't load your courses");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openAdd = () => {
    setName("");
    setColor(PRESET_COLORS[0]);
    setAdding(true);
  };

  const addCourse = async (e) => {
    e?.preventDefault?.();
    const trimmed = name.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      const { data } = await api.post("/courses", { name: trimmed, color });
      setCourses((cs) => [...cs, data]);
      handleSuccess("Course added");
      setAdding(false);
    } catch (err) {
      handleError(err?.response?.data?.message || "Couldn't add course");
    } finally {
      setSaving(false);
    }
  };

  const deleteCourse = async (courseId) => {
    if (!window.confirm("Delete this course?")) return;
    const prev = courses;
    setCourses((cs) => cs.filter((c) => c._id !== courseId));
    try {
      await api.delete("/courses", { data: { courseId } });
      handleSuccess("Course deleted");
    } catch (err) {
      handleError("Couldn't delete course");
      setCourses(prev);
    }
  };

  if (loading) return <LoadingScreen label="Loading your courses…" />;

  return (
    <>
      <PageHeader
        eyebrow="Courses"
        title="Your courses"
        subtitle="Organize your studies by course."
        actions={
          <Button onClick={openAdd}>
            <Plus size={17} /> Add course
          </Button>
        }
      />

      {courses.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={40} />}
          title="No courses yet"
          subtitle="Add your first course to start organizing your work."
          action={
            <Button onClick={openAdd}>
              <Plus size={16} /> Add a course
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <Card
              key={c._id}
              className="relative flex items-center gap-3 overflow-hidden pl-6"
            >
              <span
                className="absolute inset-y-0 left-0 w-1.5"
                style={{ background: c.color || "var(--primary)" }}
                aria-hidden="true"
              />
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ background: c.color || "var(--primary)" }}
                aria-hidden="true"
              />
              <span className="flex-1 truncate font-semibold text-ink">
                {c.name}
              </span>
              <button
                onClick={() => deleteCourse(c._id)}
                aria-label={`Delete ${c.name}`}
                className="shrink-0 rounded-lg p-2 text-muted transition hover:bg-surface-2 hover:text-danger"
              >
                <Trash2 size={16} />
              </button>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={adding}
        onClose={() => setAdding(false)}
        title="Add course"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAdding(false)}>
              Cancel
            </Button>
            <Button onClick={addCourse} loading={saving} disabled={!name.trim()}>
              Add course
            </Button>
          </>
        }
      >
        <form onSubmit={addCourse} className="space-y-4">
          <Field label="Course name" required>
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Linear Algebra"
            />
          </Field>

          <Field label="Color">
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => setColor(hex)}
                  aria-label={`Select color ${hex}`}
                  aria-pressed={color === hex}
                  className={cx(
                    "h-8 w-8 rounded-full border-2 transition",
                    color === hex ? "border-ink scale-110" : "border-border"
                  )}
                  style={{ background: hex }}
                />
              ))}
            </div>
          </Field>
        </form>
      </Modal>
    </>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ChevronDown, ChevronRight, CheckCircle2, Bug, Send } from "lucide-react";
import {
  Card,
  Button,
  Field,
  Input,
  Textarea,
  Select,
  ThemeToggle,
  cx,
} from "../components/ui";
import Logo from "../components/Logo";
import api from "../lib/http";
import { handleError, handleSuccess } from "../utils/ToastMessages";

const CATEGORIES = [
  "Bug Report",
  "Feature Request",
  "UI/UX Issue",
  "Performance Issue",
  "Security Concern",
  "Data Issue",
  "Login/Authentication",
  "Other",
];

const PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

const EMPTY = {
  title: "",
  category: "",
  priority: "medium",
  description: "",
  steps: "",
  expectedBehavior: "",
  actualBehavior: "",
  contactEmail: "",
};

export default function ReportIssue() {
  const [form, setForm] = useState(EMPTY);
  const [showMore, setShowMore] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return handleError("Issue title is required");
    if (!form.category) return handleError("Please select a category");
    if (!form.description.trim()) return handleError("Issue description is required");

    setSubmitting(true);
    try {
      await api.post("/issues", {
        title: form.title.trim(),
        category: form.category,
        priority: form.priority,
        description: form.description.trim(),
        steps: form.steps.trim() || undefined,
        expectedBehavior: form.expectedBehavior.trim() || undefined,
        actualBehavior: form.actualBehavior.trim() || undefined,
        contactEmail: form.contactEmail.trim() || undefined,
        browserInfo:
          typeof navigator !== "undefined" ? navigator.userAgent : undefined,
      });
      handleSuccess("Issue reported. Thank you!");
      setDone(true);
    } catch (err) {
      handleError(err?.response?.data?.message || "Couldn't submit your report");
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setForm(EMPTY);
    setShowMore(false);
    setDone(false);
  };

  return (
    <div className="min-h-screen bg-ground px-4 py-8">
      <div className="mx-auto flex max-w-2xl items-center justify-between">
        <Link to="/" aria-label="Back to AuraSphere home">
          <Logo />
        </Link>
        <ThemeToggle />
      </div>

      <div className="mx-auto mt-6 max-w-2xl">
        <Link
          to="/"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition hover:text-ink"
        >
          <ArrowLeft size={16} /> Back home
        </Link>

        <Card className="p-6 sm:p-8">
          {done ? (
            <div className="flex flex-col items-center py-8 text-center">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-surface-2 text-success">
                <CheckCircle2 size={36} />
              </span>
              <h1 className="mt-4 text-[26px] font-extrabold">Report received</h1>
              <p className="mt-1 max-w-sm text-muted">
                Thanks for helping us improve AuraSphere. Our team will take a
                look at your report.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Button variant="ghost" onClick={reset}>
                  Report another issue
                </Button>
                <Link to="/">
                  <Button>Done</Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-surface-2 text-primary">
                  <Bug size={22} />
                </span>
                <div>
                  <h1 className="text-[26px] font-extrabold leading-tight">
                    Report an issue
                  </h1>
                  <p className="text-sm text-muted">
                    Found a bug or have an idea? Let us know.
                  </p>
                </div>
              </div>

              <form onSubmit={submit} className="space-y-5">
                <Field label="Title" required>
                  <Input
                    value={form.title}
                    onChange={set("title")}
                    maxLength={200}
                    placeholder="Brief summary of the issue"
                  />
                </Field>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Category" required>
                    <Select value={form.category} onChange={set("category")}>
                      <option value="">Select a category</option>
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </Select>
                  </Field>

                  <Field label="Priority">
                    <Select value={form.priority} onChange={set("priority")}>
                      {PRIORITIES.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </Select>
                  </Field>
                </div>

                <Field
                  label="Description"
                  required
                  hint={`${form.description.length}/2000 characters`}
                >
                  <Textarea
                    value={form.description}
                    onChange={set("description")}
                    maxLength={2000}
                    rows={5}
                    placeholder="Describe the issue in detail…"
                  />
                </Field>

                <button
                  type="button"
                  onClick={() => setShowMore((v) => !v)}
                  aria-expanded={showMore}
                  className="flex w-full items-center gap-1.5 text-sm font-semibold text-primary"
                >
                  {showMore ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  {showMore ? "Hide extra details" : "Add more details (optional)"}
                </button>

                {showMore && (
                  <div className={cx("space-y-5 border-l-2 border-border pl-4")}>
                    <Field label="Steps to reproduce">
                      <Textarea
                        value={form.steps}
                        onChange={set("steps")}
                        maxLength={1000}
                        rows={3}
                        placeholder={"1. Go to…\n2. Click on…\n3. See error…"}
                      />
                    </Field>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field label="Expected behavior">
                        <Textarea
                          value={form.expectedBehavior}
                          onChange={set("expectedBehavior")}
                          maxLength={500}
                          rows={3}
                          placeholder="What should happen…"
                        />
                      </Field>
                      <Field label="Actual behavior">
                        <Textarea
                          value={form.actualBehavior}
                          onChange={set("actualBehavior")}
                          maxLength={500}
                          rows={3}
                          placeholder="What actually happens…"
                        />
                      </Field>
                    </div>

                    <Field
                      label="Contact email"
                      hint="Optional — so we can follow up with you."
                    >
                      <Input
                        type="email"
                        value={form.contactEmail}
                        onChange={set("contactEmail")}
                        placeholder="you@example.com"
                      />
                    </Field>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                  <Link to="/">
                    <Button type="button" variant="ghost" disabled={submitting}>
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" loading={submitting}>
                    {!submitting && <Send size={16} />} Submit report
                  </Button>
                </div>
              </form>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

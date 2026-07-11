import { useState, useEffect, useCallback } from "react";
import { User, Mail, Lock, Save, BellRing, Sparkles } from "lucide-react";
import {
  PageHeader,
  Button,
  Card,
  Badge,
  Field,
  Input,
  Avatar,
  LoadingScreen,
  cx,
} from "../components/ui";
import AuraRing from "../components/ui/AuraRing";
import api from "../lib/http";
import { useAuth } from "../contexts/AuthContext";
import { levelFromAura } from "../utils/aura";
import { handleError, handleSuccess } from "../utils/ToastMessages";

export default function Profile() {
  const { user, refresh } = useAuth();
  const [loading, setLoading] = useState(!user);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    currentPassword: "",
    password: "",
    notifyByEmail: false,
  });

  // Seed the form from a user object.
  const hydrateForm = useCallback((u) => {
    setForm({
      name: u?.name || "",
      email: u?.email || "",
      currentPassword: "",
      password: "",
      notifyByEmail: !!u?.notifyByEmail,
    });
  }, []);

  useEffect(() => {
    let active = true;
    if (user) {
      hydrateForm(user);
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const { data } = await api.get("/auth/me");
        if (active) hydrateForm(data.user);
      } catch (err) {
        handleError("Couldn't load your profile");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [user, hydrateForm]);

  const set = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    if (form.password && !form.currentPassword) {
      handleError("Enter your current password to set a new one");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        notifyByEmail: form.notifyByEmail,
      };
      if (form.password) {
        payload.password = form.password;
        payload.currentPassword = form.currentPassword;
      }
      await api.put("/auth/profile", payload);
      handleSuccess("Profile updated");
      await refresh();
      setForm((f) => ({ ...f, currentPassword: "", password: "" }));
    } catch (err) {
      const status = err?.response?.status;
      const msg =
        err?.response?.data?.message ||
        (status === 409
          ? "That email is already in use"
          : status === 400
          ? "Current password is incorrect"
          : "Couldn't update your profile");
      handleError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingScreen label="Loading your profile…" />;

  const aura = Number(user?.aura || 0);
  const { level, pct, toNext } = levelFromAura(aura);

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Profile"
        subtitle="Manage your identity, security, and notifications."
      />

      <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
        {/* Identity card */}
        <Card className="flex flex-col items-center text-center">
          <Avatar name={form.name} src={user?.avatar} size={96} />
          <h2 className="mt-4 text-xl font-bold">{form.name || "Your name"}</h2>
          <p className="mt-1 text-sm text-muted">{form.email}</p>
          {user?.role && (
            <Badge variant="neutral" className="mt-3 capitalize">
              {user.role}
            </Badge>
          )}

          <div className="mt-6">
            <AuraRing
              value={pct}
              size={168}
              thickness={18}
              label={`Level ${level}`}
              primary={aura.toLocaleString()}
              sub={`${toNext} to level ${level + 1}`}
            />
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-sm text-muted">
            <Sparkles size={14} className="text-primary" /> Total Aura
          </div>
        </Card>

        {/* Edit form */}
        <form onSubmit={save} className="flex flex-col gap-5">
          <Card>
            <h3 className="mb-4 text-lg font-bold">Edit profile</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name">
                <div className="relative">
                  <User
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint"
                  />
                  <Input
                    value={form.name}
                    onChange={set("name")}
                    placeholder="Your name"
                    autoComplete="name"
                    className="pl-9"
                  />
                </div>
              </Field>
              <Field label="Email">
                <div className="relative">
                  <Mail
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint"
                  />
                  <Input
                    type="email"
                    value={form.email}
                    onChange={set("email")}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="pl-9"
                  />
                </div>
              </Field>
            </div>
          </Card>

          <Card>
            <h3 className="mb-1 text-lg font-bold">Change password</h3>
            <p className="mb-4 text-sm text-muted">
              Leave these blank to keep your current password.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Current password">
                <div className="relative">
                  <Lock
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint"
                  />
                  <Input
                    type="password"
                    value={form.currentPassword}
                    onChange={set("currentPassword")}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="pl-9"
                  />
                </div>
              </Field>
              <Field label="New password">
                <div className="relative">
                  <Lock
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint"
                  />
                  <Input
                    type="password"
                    value={form.password}
                    onChange={set("password")}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="pl-9"
                  />
                </div>
              </Field>
            </div>
          </Card>

          <Card>
            <h3 className="mb-4 text-lg font-bold">Notifications</h3>
            <button
              type="button"
              role="switch"
              aria-checked={form.notifyByEmail}
              aria-label="Toggle email deadline reminders"
              onClick={() =>
                setForm((f) => ({ ...f, notifyByEmail: !f.notifyByEmail }))
              }
              className="flex w-full items-center justify-between gap-4 rounded-xl border border-border bg-surface-2 p-4 text-left transition hover:border-primary"
            >
              <span className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface text-primary">
                  <BellRing size={18} />
                </span>
                <span>
                  <span className="block font-semibold text-ink">
                    Email deadline reminders
                  </span>
                  <span className="mt-0.5 block text-sm text-muted">
                    Get an email before your goals and events are due.
                  </span>
                </span>
              </span>
              <span
                className={cx(
                  "relative h-6 w-11 shrink-0 rounded-full transition-colors",
                  form.notifyByEmail ? "bg-primary" : "bg-border"
                )}
              >
                <span
                  className={cx(
                    "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-card transition-transform",
                    form.notifyByEmail ? "translate-x-[22px]" : "translate-x-0.5"
                  )}
                />
              </span>
            </button>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" loading={saving}>
              <Save size={17} /> Save changes
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}

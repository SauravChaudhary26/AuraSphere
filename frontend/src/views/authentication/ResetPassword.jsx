import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import AuthLayout from "./AuthLayout";
import { Button, Field, Input } from "../../components/ui";
import api from "../../lib/http";
import { handleError, handleSuccess } from "../../utils/ToastMessages";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const id = params.get("id");
  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const invalidLink = !id || !token;

  const submit = async (e) => {
    e.preventDefault();
    if (password.length < 8) return handleError("Password must be at least 8 characters");
    if (password !== confirm) return handleError("Passwords do not match");
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { id, token, password });
      setDone(true);
      handleSuccess("Password updated");
      setTimeout(() => navigate("/login", { replace: true }), 1500);
    } catch (err) {
      handleError(err?.response?.data?.message || "This reset link is invalid or expired");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Set a new password"
      subtitle="Choose a strong password you don't use elsewhere."
      footer={<Link to="/login" className="font-semibold text-primary">Back to sign in</Link>}
    >
      {invalidLink ? (
        <div className="rounded-2xl border border-border bg-surface-2 p-6 text-center text-sm text-muted">
          This reset link is missing information. Please request a new one from the
          <Link to="/forgot-password" className="ml-1 font-semibold text-primary">forgot password</Link> page.
        </div>
      ) : done ? (
        <div className="rounded-2xl border border-border bg-surface-2 p-6 text-center">
          <ShieldCheck className="mx-auto mb-3 text-jade" size={36} />
          <p className="font-semibold">Password updated</p>
          <p className="mt-1 text-sm text-muted">Redirecting you to sign in…</p>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-4">
          <Field label="New password">
            <div className="relative">
              <Input type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="new-password" />
              <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink" aria-label="Toggle password">
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </Field>
          <Field label="Confirm password">
            <Input type={show ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" autoComplete="new-password" />
          </Field>
          <Button type="submit" loading={loading} className="w-full">Update password</Button>
        </form>
      )}
    </AuthLayout>
  );
}

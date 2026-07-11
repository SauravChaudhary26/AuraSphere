import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import AuthLayout from "./AuthLayout";
import SocialAuth from "./SocialAuth";
import { Button, Field, Input } from "../../components/ui";
import api from "../../lib/http";
import { useAuth } from "../../contexts/AuthContext";
import { handleError, handleSuccess } from "../../utils/ToastMessages";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return handleError("Email and password are required");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", form);
      login(data);
      handleSuccess("Welcome back!");
      navigate(location.state?.from || "/dashboard", { replace: true });
    } catch (err) {
      handleError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to keep your streak alive and your Aura climbing."
      footer={<>New here? <Link to="/signup" className="font-semibold text-primary">Create an account</Link></>}
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field label="Email">
          <Input type="email" name="email" autoComplete="email" value={form.email} onChange={onChange} placeholder="you@college.edu" />
        </Field>
        <Field label="Password">
          <div className="relative">
            <Input type={show ? "text" : "password"} name="password" autoComplete="current-password" value={form.password} onChange={onChange} placeholder="••••••••" />
            <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink" aria-label={show ? "Hide password" : "Show password"}>
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </Field>
        <div className="-mt-1 text-right">
          <Link to="/forgot-password" className="text-sm font-medium text-muted hover:text-primary">Forgot password?</Link>
        </div>
        <Button type="submit" loading={loading} className="w-full">Sign in</Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wide text-faint">
        <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
      </div>
      <SocialAuth />
    </AuthLayout>
  );
}

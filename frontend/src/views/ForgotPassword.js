import { useState } from "react";
import { Link } from "react-router-dom";
import { MailCheck } from "lucide-react";
import AuthLayout from "./authentication/AuthLayout";
import { Button, Field, Input } from "../components/ui";
import api from "../lib/http";
import { handleError } from "../utils/ToastMessages";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email) return handleError("Please enter your email");
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      handleError(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="We'll email you a secure link to set a new one."
      footer={<><Link to="/login" className="font-semibold text-primary">Back to sign in</Link></>}
    >
      {sent ? (
        <div className="rounded-2xl border border-border bg-surface-2 p-6 text-center">
          <MailCheck className="mx-auto mb-3 text-jade" size={36} />
          <p className="font-semibold">Check your inbox</p>
          <p className="mt-1 text-sm text-muted">
            If an account exists for <span className="text-ink">{email}</span>, a reset link is on its way. It expires in 30 minutes.
          </p>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-4">
          <Field label="Email">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@college.edu" autoComplete="email" />
          </Field>
          <Button type="submit" loading={loading} className="w-full">Send reset link</Button>
        </form>
      )}
    </AuthLayout>
  );
}

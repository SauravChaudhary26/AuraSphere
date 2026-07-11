import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Send } from "lucide-react";
import { Card, Button, Field, Input, Textarea, ThemeToggle } from "../components/ui";
import Logo from "../components/Logo";
import api from "../lib/http";
import { handleError, handleSuccess } from "../utils/ToastMessages";

export default function ContactUs() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post("/contact", form);
      handleSuccess("Message sent");
      setSent(true);
    } catch (err) {
      handleError(err?.response?.data?.message || "Couldn't send your message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-ground px-4 py-8 text-ink">
      <div className="mx-auto flex max-w-lg items-center justify-between">
        <Link to="/" aria-label="AuraSphere home">
          <Logo size={30} />
        </Link>
        <ThemeToggle />
      </div>

      <div className="mx-auto mt-10 max-w-lg">
        <Card className="p-6 sm:p-8">
          {sent ? (
            <div className="flex flex-col items-center py-8 text-center">
              <div
                className="mb-4 grid h-16 w-16 place-items-center rounded-full text-jade"
                style={{ background: "color-mix(in srgb, var(--jade) 15%, transparent)" }}
              >
                <CheckCircle2 size={36} />
              </div>
              <h1 className="text-[24px] font-extrabold">Thanks, we'll be in touch</h1>
              <p className="mt-2 text-muted">
                Your message is on its way. We'll get back to you at{" "}
                {form.email || "your email"} soon.
              </p>
              <Link
                to="/"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:brightness-110"
              >
                <ArrowLeft size={16} /> Back to home
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-[26px] font-extrabold">Get in touch</h1>
              <p className="mt-1 text-muted">
                Questions, feedback, or ideas? Send us a note and we'll reply as soon as we can.
              </p>

              <form onSubmit={submit} className="mt-6 grid gap-4">
                <Field label="Name" required>
                  <Input
                    value={form.name}
                    onChange={update("name")}
                    placeholder="Your name"
                    autoComplete="name"
                    required
                  />
                </Field>
                <Field label="Email" required>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={update("email")}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </Field>
                <Field label="Subject" required>
                  <Input
                    value={form.subject}
                    onChange={update("subject")}
                    placeholder="What's this about?"
                    required
                  />
                </Field>
                <Field label="Message" required>
                  <Textarea
                    value={form.message}
                    onChange={update("message")}
                    placeholder="Tell us more…"
                    rows={5}
                    required
                  />
                </Field>

                <Button type="submit" loading={sending} disabled={sending} className="w-full">
                  {!sending && <Send size={16} />} Send message
                </Button>
              </form>

              <Link
                to="/"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink"
              >
                <ArrowLeft size={16} /> Back to home
              </Link>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

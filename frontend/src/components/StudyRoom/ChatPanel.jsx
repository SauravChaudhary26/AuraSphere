import { useEffect, useRef, useState } from "react";
import { Lock, Send } from "lucide-react";
import { Avatar, Button, Input, cx } from "../ui";

const fmtTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export default function ChatPanel({ messages, onSend, locked, lockReason, myUserId }) {
  const [draft, setDraft] = useState("");
  const scrollRef = useRef(null);
  const nearBottomRef = useRef(true);

  // Auto-scroll only when the reader is already near the bottom, or it's their own message.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const last = messages[messages.length - 1];
    const isOwn = last?.kind === "user" && last.userId === myUserId;
    if (nearBottomRef.current || isOwn) el.scrollTop = el.scrollHeight;
  }, [messages, myUserId]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (el) nearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight <= 80;
  };

  const submit = () => {
    const text = draft.trim();
    if (!text || locked) return;
    onSend(text);
    setDraft("");
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div ref={scrollRef} onScroll={onScroll} className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="pt-8 text-center text-sm text-faint">No messages yet — say hi to the room.</div>
        )}
        {messages.map((m) =>
          m.kind === "system" ? (
            <div key={m.id} className="text-center text-xs text-faint">
              {m.text}
            </div>
          ) : (
            <div key={m.id} className="flex items-start gap-2">
              <Avatar name={m.name || ""} src={m.avatar || undefined} size={24} className="mt-0.5 shrink-0" />
              <div
                className={cx(
                  "min-w-0 flex-1 rounded-lg px-2 py-1",
                  m.userId === myUserId && "border-l-2 border-primary bg-surface-2"
                )}
              >
                <div className="flex items-baseline gap-2 text-xs text-muted">
                  <span className="truncate font-semibold">{m.userId === myUserId ? "You" : m.name}</span>
                  <span className="shrink-0 text-faint">{fmtTime(m.ts)}</span>
                </div>
                <div className="break-words text-sm text-ink">{m.text}</div>
              </div>
            </div>
          )
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-border p-3">
        {locked ? (
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-[11px] border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-muted">
            <Lock size={14} className="shrink-0" />
            <span className="truncate">{lockReason}</span>
          </div>
        ) : (
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Message the room…"
            maxLength={500}
            aria-label="Chat message"
          />
        )}
        <Button size="sm" className="shrink-0 px-3 py-2.5" onClick={submit} disabled={locked || !draft.trim()} aria-label="Send message">
          <Send size={16} />
        </Button>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Button, Field, Input, Modal, Select, Switch, cx } from "../ui";

export const ROOM_EMOJIS = ["📚", "🎯", "🔥", "🧠", "☕", "🌙", "⚡", "🌸"];

const DEFAULTS = {
  name: "Study Room",
  emoji: "📚",
  isPrivate: false,
  maxParticipants: 8,
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  cyclesBeforeLongBreak: 4,
  allowVideo: true,
  allowAudio: true,
  chatEnabled: true,
  chatFocusLock: false,
};

const clampInt = (v, min, max, fallback) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};

const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i);

function SectionLabel({ children }) {
  return (
    <div className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-faint">{children}</div>
  );
}

export default function RoomSettingsModal({ open, onClose, mode, initial, onSubmit, submitting }) {
  const [form, setForm] = useState({ ...DEFAULTS, ...initial });

  // Re-seed the form each time the modal opens (fresh create / latest settings).
  useEffect(() => {
    if (open) setForm({ ...DEFAULTS, ...initial });
  }, [open, initial]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const submit = () => {
    const name = String(form.name || "").trim().slice(0, 40);
    onSubmit({
      ...form,
      name: name.length >= 3 ? name : DEFAULTS.name,
      emoji: ROOM_EMOJIS.includes(form.emoji) ? form.emoji : DEFAULTS.emoji,
      isPrivate: !!form.isPrivate,
      maxParticipants: clampInt(form.maxParticipants, 2, 12, DEFAULTS.maxParticipants),
      focusMinutes: clampInt(form.focusMinutes, 5, 120, DEFAULTS.focusMinutes),
      shortBreakMinutes: clampInt(form.shortBreakMinutes, 1, 30, DEFAULTS.shortBreakMinutes),
      longBreakMinutes: clampInt(form.longBreakMinutes, 5, 60, DEFAULTS.longBreakMinutes),
      cyclesBeforeLongBreak: clampInt(form.cyclesBeforeLongBreak, 2, 8, DEFAULTS.cyclesBeforeLongBreak),
      allowVideo: !!form.allowVideo,
      allowAudio: !!form.allowAudio,
      chatEnabled: !!form.chatEnabled,
      chatFocusLock: !!form.chatFocusLock,
    });
  };

  const isCreate = mode === "create";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isCreate ? "Create study room" : "Room settings"}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} loading={submitting}>
            {isCreate ? "Create room" : "Save changes"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <SectionLabel>Basics</SectionLabel>
        <Field label="Room name">
          <Input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            maxLength={40}
            placeholder="Evening Grind"
          />
        </Field>
        <Field label="Room emoji">
          <div className="flex flex-wrap gap-2">
            {ROOM_EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => set("emoji", e)}
                aria-label={`Emoji ${e}`}
                className={cx(
                  "grid h-10 w-10 place-items-center rounded-xl border text-xl transition",
                  form.emoji === e
                    ? "border-primary bg-surface-2 shadow-card"
                    : "border-border bg-surface hover:border-primary"
                )}
              >
                {e}
              </button>
            ))}
          </div>
        </Field>
        <Switch
          checked={form.isPrivate}
          onChange={(v) => set("isPrivate", v)}
          label="Private room — join by code only"
        />
        <Field label="Max participants">
          <Select
            value={form.maxParticipants}
            onChange={(e) => set("maxParticipants", Number(e.target.value))}
          >
            {range(2, 12).map((n) => (
              <option key={n} value={n}>
                {n} people
              </option>
            ))}
          </Select>
        </Field>

        <SectionLabel>Timer</SectionLabel>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Focus (min)" hint="5–120">
            <Input
              type="number"
              min={5}
              max={120}
              value={form.focusMinutes}
              onChange={(e) => set("focusMinutes", e.target.value)}
            />
          </Field>
          <Field label="Short break (min)" hint="1–30">
            <Input
              type="number"
              min={1}
              max={30}
              value={form.shortBreakMinutes}
              onChange={(e) => set("shortBreakMinutes", e.target.value)}
            />
          </Field>
          <Field label="Long break (min)" hint="5–60">
            <Input
              type="number"
              min={5}
              max={60}
              value={form.longBreakMinutes}
              onChange={(e) => set("longBreakMinutes", e.target.value)}
            />
          </Field>
        </div>
        <Field label="Focus sessions before a long break">
          <Select
            value={form.cyclesBeforeLongBreak}
            onChange={(e) => set("cyclesBeforeLongBreak", Number(e.target.value))}
          >
            {range(2, 8).map((n) => (
              <option key={n} value={n}>
                {n} sessions
              </option>
            ))}
          </Select>
        </Field>

        <SectionLabel>Media &amp; Chat</SectionLabel>
        <div className="flex flex-col gap-3">
          <div>
            <Switch
              checked={form.allowVideo}
              onChange={(v) => set("allowVideo", v)}
              label="Allow video"
            />
            <p className="ml-[54px] text-xs text-faint">Participants can turn their camera on.</p>
          </div>
          <div>
            <Switch
              checked={form.allowAudio}
              onChange={(v) => set("allowAudio", v)}
              label="Allow audio"
            />
            <p className="ml-[54px] text-xs text-faint">Participants can unmute their mic.</p>
          </div>
          <div>
            <Switch
              checked={form.chatEnabled}
              onChange={(v) => set("chatEnabled", v)}
              label="Enable chat"
            />
            <p className="ml-[54px] text-xs text-faint">Room-wide text chat.</p>
          </div>
          <div>
            <Switch
              checked={form.chatFocusLock}
              onChange={(v) => set("chatFocusLock", v)}
              label="Deep focus — lock chat during focus"
            />
            <p className="ml-[54px] text-xs text-faint">
              Chat and reactions pause while a focus session runs.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}

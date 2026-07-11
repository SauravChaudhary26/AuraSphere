import { useRef } from "react";
import { cx } from "../ui";

const REACTION_EMOJIS = ["🔥", "👏", "💪", "☕", "🎉", "🧠", "❤️", "😴"];
const THROTTLE_MS = 400;

export default function ReactionBar({ onReact, disabled }) {
  const lastSentRef = useRef(0);

  const react = (emoji) => {
    if (disabled) return;
    const now = Date.now();
    if (now - lastSentRef.current < THROTTLE_MS) return;
    lastSentRef.current = now;
    onReact(emoji);
  };

  return (
    <div
      className={cx("flex items-center gap-1", disabled && "opacity-50")}
      title={disabled ? "Locked during focus" : undefined}
    >
      {REACTION_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          disabled={disabled}
          onClick={() => react(emoji)}
          aria-label={`React with ${emoji}`}
          title={disabled ? "Locked during focus" : undefined}
          className="rounded-lg bg-surface-2 px-2 py-1 text-lg transition hover:bg-border active:scale-90 disabled:cursor-not-allowed"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

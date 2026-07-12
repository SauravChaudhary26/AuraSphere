import { useRef } from "react";
import { cx } from "../ui";

const REACTION_EMOJIS = ["🔥", "👏", "💪", "☕", "🎉", "🧠", "❤️", "😴"];
// Store Reaction Pack extras — must match PREMIUM_REACTION_EMOJIS on the backend.
const PREMIUM_REACTION_EMOJIS = ["🤯", "🚀", "💎", "🦄", "🍕", "🌈"];
const THROTTLE_MS = 400;

export default function ReactionBar({ onReact, disabled, ownsPack }) {
  const lastSentRef = useRef(0);

  const react = (emoji) => {
    if (disabled) return;
    const now = Date.now();
    if (now - lastSentRef.current < THROTTLE_MS) return;
    lastSentRef.current = now;
    onReact(emoji);
  };

  const button = (emoji, locked) => (
    <button
      key={emoji}
      type="button"
      disabled={disabled || locked}
      onClick={() => !locked && react(emoji)}
      aria-label={locked ? `${emoji} — unlock with the Reaction Pack` : `React with ${emoji}`}
      title={
        locked
          ? "Unlock with the Reaction Pack in the Aura Store"
          : disabled
          ? "Locked during focus"
          : undefined
      }
      className={cx(
        "rounded-lg bg-surface-2 px-2 py-1 text-lg transition hover:bg-border active:scale-90 disabled:cursor-not-allowed",
        locked && "opacity-40 grayscale"
      )}
    >
      {emoji}
    </button>
  );

  return (
    <div
      className={cx("flex flex-wrap items-center gap-1", disabled && "opacity-50")}
      title={disabled ? "Locked during focus" : undefined}
    >
      {REACTION_EMOJIS.map((emoji) => button(emoji, false))}
      <span className="mx-0.5 h-5 w-px bg-border" aria-hidden="true" />
      {PREMIUM_REACTION_EMOJIS.map((emoji) => button(emoji, !ownsPack))}
    </div>
  );
}

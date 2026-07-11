import { useEffect } from "react";
import { Brain, PartyPopper, RotateCcw, Sparkles, Target, Timer } from "lucide-react";
import { Button, Card, StatTile } from "../ui";
import { fireConfetti } from "./confetti";

export default function SummaryView({ summary, onBackToLobby }) {
  useEffect(() => {
    if (summary?.auraEarned > 0) fireConfetti();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!summary) return null;

  return (
    <div className="mx-auto max-w-2xl">
      <Card className="flex flex-col items-center gap-6 p-8 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-surface-2 text-primary">
          <PartyPopper size={30} />
        </span>
        <div>
          <h2 className="text-xl font-bold">
            Great session in {summary.emoji} {summary.roomName}!
          </h2>
          <p className="mt-1 text-sm text-muted">
            Every focused minute counts. Here's your haul.
          </p>
        </div>

        <div className="grid w-full grid-cols-2 gap-3 text-left sm:grid-cols-4">
          <StatTile icon={<Timer size={14} />} label="Focus time" value={`${summary.focusMinutes} min`} tone="gold" />
          <StatTile icon={<Brain size={14} />} label="Sessions" value={summary.focusSessions} tone="jade" />
          <StatTile icon={<Sparkles size={14} />} label="Aura earned" value={`+${summary.auraEarned} ✨`} tone="gold" />
          <StatTile icon={<Target size={14} />} label="Goals" value={`${summary.goalsDone}/${summary.goalsTotal}`} tone="jade" />
        </div>

        <Button onClick={onBackToLobby}>
          <RotateCcw size={16} /> Back to lobby
        </Button>
      </Card>
    </div>
  );
}

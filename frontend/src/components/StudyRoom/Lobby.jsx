import { useState } from "react";
import { Plus, Users, DoorOpen, Sparkles } from "lucide-react";
import { Badge, Button, Card, EmptyState, Input, cx } from "../ui";
import RoomSettingsModal from "./RoomSettingsModal";

const phaseBadge = (phase) => {
  if (phase === "focus") return <Badge variant="gold">Focus</Badge>;
  if (phase === "short_break" || phase === "long_break") return <Badge variant="jade">Break</Badge>;
  return <Badge variant="neutral">Open</Badge>;
};

export default function Lobby({ publicRooms, connected, onCreate, onJoin }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [code, setCode] = useState("");
  const [joining, setJoining] = useState(false);

  const handleCreate = async (settings) => {
    setCreating(true);
    const ok = await onCreate(settings);
    setCreating(false);
    if (ok) setCreateOpen(false);
  };

  const handleJoin = async (roomCode) => {
    const clean = String(roomCode ?? code).trim().toUpperCase();
    if (!clean || joining) return;
    setJoining(true);
    await onJoin(clean);
    setJoining(false);
  };

  return (
    <>
      <div className="grid gap-5 md:grid-cols-2">
        <Card className="flex flex-col gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-surface-2 text-primary">
            <Sparkles size={22} />
          </span>
          <div>
            <h2 className="text-lg font-bold">Create a room</h2>
            <p className="mt-1 text-sm text-muted">
              Pick your Pomodoro rhythm, invite friends with a 6-letter code, and study together
              with video, chat and shared goals.
            </p>
          </div>
          <div className="mt-auto pt-2">
            <Button onClick={() => setCreateOpen(true)}>
              <Plus size={16} /> Create a room
            </Button>
          </div>
        </Card>

        <Card className="flex flex-col gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-surface-2 text-primary">
            <DoorOpen size={22} />
          </span>
          <div>
            <h2 className="text-lg font-bold">Join with a code</h2>
            <p className="mt-1 text-sm text-muted">
              Got a room code from a friend? Enter it here to jump straight in.
            </p>
          </div>
          <div className="mt-auto flex gap-2 pt-2">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              placeholder="XK4P2M"
              maxLength={6}
              className="mono uppercase tracking-[0.3em]"
              aria-label="Room code"
            />
            <Button onClick={() => handleJoin()} loading={joining} disabled={code.trim().length < 6}>
              Join
            </Button>
          </div>
        </Card>
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Live rooms</h2>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-muted">
            <span className={cx("h-2 w-2 rounded-full", connected ? "bg-success" : "bg-danger")} />
            Live
          </span>
        </div>

        {publicRooms.length === 0 ? (
          <EmptyState
            icon={<Users size={40} />}
            title="No public rooms right now"
            subtitle="No public rooms right now — start one and invite friends with the code"
            action={
              <Button onClick={() => setCreateOpen(true)}>
                <Plus size={16} /> Create a room
              </Button>
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            {publicRooms.map((r) => {
              const full = r.participantCount >= r.maxParticipants;
              return (
                <Card key={r.id} className="flex flex-wrap items-center gap-3 p-4">
                  <span className="text-2xl">{r.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">{r.name}</div>
                    <div className="text-xs text-muted">
                      Hosted by {r.hostName} · {r.focusMinutes} min focus
                    </div>
                  </div>
                  <span className="flex items-center gap-1.5 text-sm text-muted">
                    <Users size={15} />
                    <span className="mono">
                      {r.participantCount}/{r.maxParticipants}
                    </span>
                  </span>
                  {phaseBadge(r.phase)}
                  <Button size="sm" disabled={full} onClick={() => handleJoin(r.id)}>
                    {full ? "Full" : "Join"}
                  </Button>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <RoomSettingsModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        mode="create"
        onSubmit={handleCreate}
        submitting={creating}
      />
    </>
  );
}

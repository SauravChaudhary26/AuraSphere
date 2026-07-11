import { useState } from "react";
import { Play, DoorOpen, Wifi } from "lucide-react";
import { Card, Button, Field, Input, Select, Badge, Avatar } from "../ui";

const DURATIONS = [
  { value: 15, label: "15 minutes" },
  { value: 25, label: "25 minutes (Pomodoro)" },
  { value: 50, label: "50 minutes" },
];

/**
 * Lobby form. Collects a room id + a study duration; the participant name is
 * taken from the signed-in user, so only these two fields are shown.
 */
const JoinRoomForm = ({ onJoin, joining = false, userName = "" }) => {
  const [roomName, setRoomName] = useState("default-room");
  const [studyMinutes, setStudyMinutes] = useState(25);
  const [error, setError] = useState("");

  const submit = (e) => {
    e?.preventDefault();
    const room = roomName.trim();
    if (!room) {
      setError("Please enter a room name");
      return;
    }
    setError("");
    onJoin({ roomName: room, studyMinutes: Number(studyMinutes) });
  };

  return (
    <div className="mx-auto max-w-md">
      <Card as="form" onSubmit={submit} className="p-6">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 grid h-14 w-14 place-items-center rounded-full bg-surface-2 text-primary">
            <DoorOpen size={26} />
          </span>
          <h2 className="text-xl font-bold">Join a study room</h2>
          <p className="mt-1 text-sm text-muted">Focus alongside others in real time.</p>
          {userName && (
            <div className="mt-3 flex items-center gap-2">
              <Avatar name={userName} size={26} />
              <span className="text-sm text-muted">
                Joining as <span className="font-semibold text-ink">{userName}</span>
              </span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Field label="Room name" required error={error} hint="Share this name so friends land in the same room.">
            <Input
              value={roomName}
              onChange={(e) => {
                setRoomName(e.target.value);
                if (error) setError("");
              }}
              placeholder="e.g. finals-crunch"
              maxLength={40}
              disabled={joining}
              aria-label="Room name"
            />
          </Field>

          <Field label="Study duration">
            <Select
              value={studyMinutes}
              onChange={(e) => setStudyMinutes(Number(e.target.value))}
              disabled={joining}
              aria-label="Study duration"
            >
              {DURATIONS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </Select>
          </Field>

          <Button type="submit" loading={joining} disabled={joining} className="w-full">
            {!joining && <Play size={17} />}
            {joining ? "Joining…" : "Start studying"}
          </Button>

          <div className="flex items-center justify-center gap-2 pt-1">
            <Badge variant="neutral" dot>
              <Wifi size={12} /> Connects when you join
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default JoinRoomForm;

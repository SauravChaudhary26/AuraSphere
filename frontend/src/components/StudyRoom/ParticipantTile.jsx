import { useEffect, useRef } from "react";
import { Crown, MicOff, VideoOff, X } from "lucide-react";
import { Avatar, Badge, cx } from "../ui";
import useAudioLevel from "./useAudioLevel";

export default function ParticipantTile({ participant, stream, isSelf, canKick, onKick }) {
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const speaking = useAudioLevel(stream);

  const hasLiveVideo = !!stream && stream.getVideoTracks().some((t) => t.readyState === "live");
  const showVideo = !!participant.videoOn && hasLiveVideo;
  // Roster flags gate playback, not just icons: a stream whose owner shows as
  // muted must not be audible, whatever the peer actually sends.
  const audioEnabled = !isSelf && !!participant.audioOn;

  // srcObject has no React attribute — bind imperatively. The hidden <audio>
  // keeps remote voice audible while the peer's camera is off.
  useEffect(() => {
    const el = videoRef.current || audioRef.current;
    if (el && stream && el.srcObject !== stream) el.srcObject = stream;
    return () => {
      if (el) el.srcObject = null;
    };
  }, [stream, showVideo, audioEnabled]);

  const goals = participant.goals || [];
  const goalsDone = goals.filter((g) => g.done).length;

  const kick = () => {
    if (window.confirm(`Remove ${participant.name} from the room?`)) onKick(participant.socketId);
  };

  return (
    <div
      className={cx(
        "group relative aspect-video overflow-hidden rounded-xl2 border border-border bg-surface-2 transition-shadow",
        speaking && "ring-2 ring-[var(--jade)] shadow-glow"
      )}
    >
      {showVideo ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={!audioEnabled}
          className={cx("h-full w-full object-cover", isSelf && "scale-x-[-1]")}
        />
      ) : (
        <>
          <div className="grid h-full w-full place-items-center bg-gradient-to-br from-surface-2 to-surface">
            <Avatar name={participant.name} src={participant.avatar || undefined} size={56} />
          </div>
          {audioEnabled && stream && <audio ref={audioRef} autoPlay />}
        </>
      )}

      <div
        className={cx(
          "absolute inset-x-0 bottom-0 flex items-center gap-1.5 px-2.5 py-1.5 text-xs",
          showVideo ? "bg-gradient-to-t from-black/60 to-transparent text-white" : "text-ink"
        )}
      >
        <span className="truncate font-semibold">
          {participant.name}
          {isSelf && " (you)"}
        </span>
        {participant.isHost && <Crown size={13} className="shrink-0 text-primary" />}
        {!participant.audioOn && <MicOff size={13} className="shrink-0 text-faint" />}
        {!participant.videoOn && <VideoOff size={13} className="shrink-0 text-faint" />}
        <span className="flex-1" />
        {goals.length > 0 && (
          <Badge variant="neutral" className="px-1.5 py-0 text-[10px]">
            {goalsDone}/{goals.length}
          </Badge>
        )}
        {participant.focusSessionsCompleted > 0 && (
          <span className="shrink-0 text-[10px] font-semibold">{participant.focusSessionsCompleted}× 🔥</span>
        )}
      </div>

      {canKick && (
        <button
          type="button"
          onClick={kick}
          title="Remove from room"
          className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-danger text-white opacity-0 transition group-hover:opacity-100"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}

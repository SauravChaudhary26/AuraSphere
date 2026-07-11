import { DoorOpen, Mic, MicOff, Video, VideoOff, Volume2 } from "lucide-react";
import { Button, Card, Select, cx } from "../ui";

function RoundToggle({ on, disabled, onClick, title, children }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      title={title}
      className={cx(
        "grid h-11 w-11 place-items-center rounded-full transition active:translate-y-px",
        on ? "bg-primary text-on-primary shadow-glow" : "bg-surface-2 text-muted hover:text-ink",
        "disabled:cursor-not-allowed disabled:opacity-50"
      )}
    >
      {children}
    </button>
  );
}

export default function ControlBar({
  videoOn,
  audioOn,
  onToggleVideo,
  onToggleAudio,
  allowVideo,
  allowAudio,
  mediaError,
  ambient,
  onAmbientChange,
  ambientVolume,
  onAmbientVolume,
  onLeave,
  children,
}) {
  return (
    <Card className="flex flex-wrap items-center gap-2 p-3">
      <RoundToggle
        on={audioOn}
        disabled={!allowAudio}
        onClick={onToggleAudio}
        title={!allowAudio ? "Disabled by host" : audioOn ? "Mute microphone" : "Unmute microphone"}
      >
        {audioOn ? <Mic size={18} /> : <MicOff size={18} />}
      </RoundToggle>
      <RoundToggle
        on={videoOn}
        disabled={!allowVideo}
        onClick={onToggleVideo}
        title={!allowVideo ? "Disabled by host" : videoOn ? "Turn camera off" : "Turn camera on"}
      >
        {videoOn ? <Video size={18} /> : <VideoOff size={18} />}
      </RoundToggle>

      <div className="mx-1 h-6 w-px bg-border" />

      <Volume2 size={16} className="shrink-0 text-muted" />
      <Select
        value={ambient}
        onChange={(e) => onAmbientChange(e.target.value)}
        aria-label="Ambient sound"
        className="max-w-[130px] px-2.5 py-1.5 text-sm"
      >
        <option value="off">Off</option>
        <option value="rain">Rain 🌧</option>
        <option value="waves">Waves 🌊</option>
        <option value="deep">Deep 🎧</option>
      </Select>
      {ambient !== "off" && (
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={ambientVolume}
          onChange={(e) => onAmbientVolume(Number(e.target.value))}
          aria-label="Ambient volume"
          className="w-20 accent-primary"
        />
      )}

      {children}

      <span className="flex-1" />

      {mediaError && <span className="text-xs text-danger">{mediaError}</span>}
      <Button variant="danger" size="sm" onClick={onLeave}>
        <DoorOpen size={16} />
        Leave
      </Button>
    </Card>
  );
}

import { useEffect, useRef, useState } from "react";
import { BarChart3, Copy, DoorOpen, MessageSquare, Settings, Target, Users } from "lucide-react";
import { Button, Card, Tabs } from "../ui";
import { handleSuccess } from "../../utils/ToastMessages";
import RoomSettingsModal from "./RoomSettingsModal";
import TimerPanel from "./TimerPanel";
import ParticipantGrid from "./ParticipantGrid";
import ControlBar from "./ControlBar";
import ChatPanel from "./ChatPanel";
import GoalsPanel from "./GoalsPanel";
import StatsPanel from "./StatsPanel";
import ReactionBar from "./ReactionBar";
import ReactionsOverlay from "./ReactionsOverlay";
import useWebRTC from "./useWebRTC";
import useAmbientSound from "./useAmbientSound";
import useOwnedItems from "../../lib/useOwnedItems";

export default function RoomView({ sr, socket }) {
  const { room, participants, timer } = sr;
  const settings = room.settings;
  const owned = useOwnedItems();

  const rtc = useWebRTC({
    socket,
    mySocketId: sr.mySocketId,
    participants,
    allowVideo: settings.allowVideo,
    allowAudio: settings.allowAudio,
  });
  const { ambient, setAmbient, volume, setVolume } = useAmbientSound();

  const [tab, setTab] = useState("chat");
  const [unread, setUnread] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  // Count chat messages that arrive while another tab is active. Tracked by
  // last-seen message id — array length pins at the 200-message history cap,
  // so length deltas would stop counting mid-session.
  const lastMsgId = sr.chat.length ? sr.chat[sr.chat.length - 1].id : null;
  const lastSeenIdRef = useRef(lastMsgId);
  useEffect(() => {
    if (tab === "chat") {
      lastSeenIdRef.current = lastMsgId;
      return;
    }
    if (lastMsgId == null || lastMsgId === lastSeenIdRef.current) return;
    const idx = sr.chat.findIndex((m) => m.id === lastSeenIdRef.current);
    setUnread(sr.chat.length - idx - 1); // idx === -1 → the whole buffer is unread
  }, [lastMsgId, tab, sr.chat]);

  const selectTab = (id) => {
    setTab(id);
    if (id === "chat") setUnread(0);
  };

  const copyCode = () => {
    navigator.clipboard
      ?.writeText(room.id)
      .then(() => handleSuccess("Room code copied"))
      .catch(() => {});
  };

  const saveSettings = async (patch) => {
    setSavingSettings(true);
    const ok = await sr.updateSettings(patch);
    setSavingSettings(false);
    if (ok) setEditOpen(false);
  };

  const hostName = participants.find((p) => p.socketId === room.hostSocketId)?.name;
  const chatLockReason = !settings.chatEnabled
    ? "Chat is disabled in this room"
    : "Deep focus — chat unlocks at break";

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="relative flex flex-col gap-5">
        <Card className="flex flex-wrap items-center gap-3 p-4">
          <span className="text-2xl">{room.emoji}</span>
          <h1 className="min-w-0 truncate text-lg font-bold">{room.name}</h1>
          <button
            type="button"
            onClick={copyCode}
            title="Copy room code"
            className="mono flex items-center gap-1.5 rounded-lg bg-surface-2 px-2.5 py-1 text-sm font-semibold tracking-[0.2em] text-muted transition hover:text-ink"
          >
            {room.id}
            <Copy size={13} />
          </button>
          <span className="flex items-center gap-1.5 text-sm text-muted">
            <Users size={15} />
            <span className="mono">
              {participants.length}/{settings.maxParticipants}
            </span>
          </span>
          <span className="flex-1" />
          {sr.isHost && (
            <>
              <Button variant="ghost" size="sm" onClick={() => setEditOpen(true)} title="Room settings">
                <Settings size={15} /> Settings
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-danger"
                onClick={() => window.confirm("End the room for everyone?") && sr.endRoom()}
              >
                End for all
              </Button>
            </>
          )}
          <Button variant="subtle" size="sm" onClick={sr.leaveRoom}>
            <DoorOpen size={15} /> Leave
          </Button>
        </Card>

        <TimerPanel
          timer={timer}
          settings={settings}
          isHost={sr.isHost}
          onControl={sr.timerControl}
          hostName={hostName}
        />

        <ParticipantGrid
          participants={participants}
          mySocketId={sr.mySocketId}
          isHost={sr.isHost}
          onKick={sr.kick}
          streams={rtc.streams}
          localStream={rtc.localStream}
        />

        <ControlBar
          videoOn={rtc.videoOn}
          audioOn={rtc.audioOn}
          onToggleVideo={rtc.toggleVideo}
          onToggleAudio={rtc.toggleAudio}
          allowVideo={settings.allowVideo}
          allowAudio={settings.allowAudio}
          mediaError={rtc.mediaError}
          ambient={ambient}
          onAmbientChange={setAmbient}
          ambientVolume={volume}
          onAmbientVolume={setVolume}
          ownsSoundPack={owned.has("focus_sound_pack")}
          onLeave={sr.leaveRoom}
        >
          <ReactionBar
            onReact={sr.sendReaction}
            disabled={sr.reactionsLocked}
            ownsPack={owned.has("reaction_pack")}
          />
        </ControlBar>

        <ReactionsOverlay reactions={sr.reactions} />
      </div>

      <Card className="flex h-[520px] flex-col overflow-hidden p-0 lg:sticky lg:top-20 lg:h-[calc(100vh-160px)]">
        <div className="border-b border-border p-2">
          <Tabs
            tabs={[
              { id: "chat", label: "Chat", icon: MessageSquare, badge: unread },
              { id: "goals", label: "Goals", icon: Target },
              { id: "stats", label: "Stats", icon: BarChart3 },
            ]}
            active={tab}
            onChange={selectTab}
          />
        </div>
        <div className="min-h-0 flex-1">
          {tab === "chat" && (
            <ChatPanel
              messages={sr.chat}
              onSend={sr.sendChat}
              locked={sr.chatLocked}
              lockReason={chatLockReason}
              myUserId={sr.me?.userId}
            />
          )}
          {tab === "goals" && (
            <GoalsPanel
              myGoals={sr.myGoals}
              onSetGoals={sr.setGoals}
              participants={participants}
              myUserId={sr.me?.userId}
            />
          )}
          {tab === "stats" && (
            <StatsPanel
              participants={participants}
              timer={timer}
              auraEarned={sr.auraEarned}
              mySocketId={sr.mySocketId}
            />
          )}
        </div>
      </Card>

      <RoomSettingsModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        mode="edit"
        initial={settings}
        onSubmit={saveSettings}
        submitting={savingSettings}
      />
    </div>
  );
}

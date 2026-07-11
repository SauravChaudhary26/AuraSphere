import { useEffect, useRef, useState } from "react";
import { Card, LoadingScreen, PageHeader } from "../ui";
import { useSocket } from "../../contexts/SocketContext";
import useStudyRoom from "./useStudyRoom";
import Lobby from "./Lobby";
import RoomView from "./RoomView";
import SummaryView from "./SummaryView";

const PHASE_TITLES = { focus: "Focus", short_break: "Break", long_break: "Long break" };

const fmt = (ms) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

const StudyRoom = () => {
  const { connect, disconnect } = useSocket();
  // Acquire the shared socket in an effect (never at render time): StrictMode's
  // simulated unmount disconnects it, and the remount must get a live instance.
  const [socket, setSocket] = useState(null);
  const [noAuth, setNoAuth] = useState(false);
  const sr = useStudyRoom(socket);

  // Tab-title countdown while a phase is live; restore on cleanup.
  const baseTitleRef = useRef(document.title);
  useEffect(() => {
    const base = baseTitleRef.current;
    const t = sr.timer;
    const label = PHASE_TITLES[t.phase];
    if (label && t.running && t.phaseEndsAt) {
      const tick = () => {
        document.title = `▶ ${fmt(t.phaseEndsAt - Date.now())} · ${label} — AuraSphere`;
      };
      tick();
      const id = setInterval(tick, 1000);
      return () => {
        clearInterval(id);
        document.title = base;
      };
    }
    if (label && t.remainingMs != null) {
      document.title = `⏸ ${fmt(t.remainingMs)} · ${label} — AuraSphere`;
      return () => {
        document.title = base;
      };
    }
    document.title = base;
  }, [sr.timer]);

  // Best-effort: leave the room + tear down the socket on unmount.
  const cleanupRef = useRef(() => {});
  cleanupRef.current = () => {
    if (sr.view === "room") sr.leaveRoom();
    disconnect();
  };
  useEffect(() => {
    const s = connect();
    setSocket(s);
    setNoAuth(!s);
    return () => {
      cleanupRef.current();
      setSocket(null);
    };
  }, [connect]);

  if (!socket) {
    if (!noAuth) return <LoadingScreen label="Connecting…" />;
    return (
      <Card className="mx-auto max-w-md p-8 text-center">
        <h2 className="text-lg font-bold">Log in to study together</h2>
        <p className="mt-2 text-sm text-muted">
          Study rooms are live spaces — you need to be logged in to join one.
        </p>
      </Card>
    );
  }

  if (sr.view === "room" && sr.room) {
    return <RoomView sr={sr} socket={socket} />;
  }

  if (sr.view === "summary" && sr.summary) {
    return (
      <>
        <PageHeader
          eyebrow="Focus"
          title="Session summary"
          subtitle="Here's what you accomplished."
        />
        <SummaryView summary={sr.summary} onBackToLobby={sr.backToLobby} />
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Focus"
        title="Study Rooms"
        subtitle="Create or join a live Pomodoro room and lock in with other students."
      />
      <Lobby
        publicRooms={sr.publicRooms}
        connected={sr.connected}
        onCreate={sr.createRoom}
        onJoin={sr.joinRoom}
      />
    </>
  );
};

export default StudyRoom;

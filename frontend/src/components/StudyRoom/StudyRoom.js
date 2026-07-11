import { useState, useEffect, useRef, useCallback } from "react";
import { LogOut, PartyPopper, RotateCcw } from "lucide-react";
import { PageHeader, Button, Card } from "../ui";
import { useSocket } from "../../contexts/SocketContext";
import { useAuth } from "../../contexts/AuthContext";
import { handleError, handleSuccess } from "../../utils/ToastMessages";
import JoinRoomForm from "./JoinRoomForm";
import StudyRoomInterface from "./StudyRoomInterface";

const StudyRoom = () => {
  const { connected, connect, disconnect } = useSocket();
  const { user } = useAuth();

  const [phase, setPhase] = useState("join"); // 'join' | 'studying' | 'done'
  const [socket, setSocket] = useState(null);
  const [pendingRoom, setPendingRoom] = useState(null);
  const [studyMinutes, setStudyMinutes] = useState(25);
  const [roomId, setRoomId] = useState(null);
  const [endsAt, setEndsAt] = useState(null);
  const [users, setUsers] = useState([]);
  const [joining, setJoining] = useState(false);

  const userName = user?.name || "Anonymous";
  const avatar = (user?.name || "?").charAt(0).toUpperCase();

  const reset = useCallback(() => {
    setPhase("join");
    setPendingRoom(null);
    setSocket(null);
    setRoomId(null);
    setEndsAt(null);
    setUsers([]);
    setJoining(false);
  }, []);

  const handleJoin = ({ roomName, studyMinutes: mins }) => {
    const s = connect();
    if (!s) {
      handleError("Please log in to join a study room");
      return;
    }
    setStudyMinutes(mins);
    setPendingRoom(roomName);
    setSocket(s);
    setJoining(true);
  };

  // Attach listeners + emit the join once we have a socket + a pending room.
  useEffect(() => {
    if (!socket || !pendingRoom) return;

    const onJoined = ({ roomId: joinedRoomId, endsAt: end }) => {
      setRoomId(joinedRoomId);
      setEndsAt(Number(end));
      setPhase("studying");
      setJoining(false);
      handleSuccess("You're in — happy studying!");
    };
    const onUsers = (list) => setUsers(Array.isArray(list) ? list : []);
    const onEnded = () => setPhase("done");

    socket.on("joined-room-success", onJoined);
    socket.on("room-users-updated", onUsers);
    socket.on("study-time-ended", onEnded);

    socket.emit("join-study-room", {
      roomId: pendingRoom,
      name: userName,
      avatar,
      studyMinutes,
    });

    return () => {
      socket.off("joined-room-success", onJoined);
      socket.off("room-users-updated", onUsers);
      socket.off("study-time-ended", onEnded);
    };
  }, [socket, pendingRoom, userName, avatar, studyMinutes]);

  const handleLeave = useCallback(() => {
    if (socket && roomId) socket.emit("leave-study-room", roomId);
    disconnect();
    reset();
  }, [socket, roomId, disconnect, reset]);

  // Best-effort cleanup: leave the room + tear down the socket on unmount.
  const leaveRef = useRef(() => {});
  leaveRef.current = () => {
    if (socket && roomId) socket.emit("leave-study-room", roomId);
    disconnect();
  };
  useEffect(() => () => leaveRef.current(), []);

  const backToLobby = () => {
    disconnect();
    reset();
  };

  return (
    <>
      <PageHeader
        eyebrow="Focus"
        title="Study Room"
        subtitle="Join a room and lock in alongside other students."
        actions={
          phase === "studying" ? (
            <Button variant="danger" onClick={handleLeave}>
              <LogOut size={16} /> Leave
            </Button>
          ) : null
        }
      />

      {phase === "join" && (
        <JoinRoomForm onJoin={handleJoin} joining={joining} userName={userName} />
      )}

      {phase === "studying" && endsAt != null && (
        <StudyRoomInterface
          roomId={roomId}
          endsAt={endsAt}
          studyMinutes={studyMinutes}
          users={users}
          connected={connected}
          mySocketId={socket?.id}
        />
      )}

      {phase === "done" && (
        <div className="mx-auto max-w-md">
          <Card className="flex flex-col items-center gap-4 p-8 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-surface-2 text-primary">
              <PartyPopper size={30} />
            </span>
            <div>
              <h2 className="text-xl font-bold">Session complete</h2>
              <p className="mt-1 text-sm text-muted">
                Nice focus, {userName.split(" ")[0]}. Take a well-earned break.
              </p>
            </div>
            <Button onClick={backToLobby}>
              <RotateCcw size={16} /> Back to lobby
            </Button>
          </Card>
        </div>
      )}
    </>
  );
};

export default StudyRoom;

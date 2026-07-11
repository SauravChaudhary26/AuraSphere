import ParticipantTile from "./ParticipantTile";

export default function ParticipantGrid({ participants, mySocketId, isHost, onKick, streams, localStream }) {
  const self = participants.filter((p) => p.socketId === mySocketId);
  const others = participants.filter((p) => p.socketId !== mySocketId);
  const ordered = [...self, ...others];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
      {ordered.map((p) => {
        const isSelf = p.socketId === mySocketId;
        return (
          <ParticipantTile
            key={p.socketId}
            participant={p}
            stream={isSelf ? localStream : streams.get(p.socketId)}
            isSelf={isSelf}
            canKick={isHost && !isSelf}
            onKick={onKick}
          />
        );
      })}
    </div>
  );
}

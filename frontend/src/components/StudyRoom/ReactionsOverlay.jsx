export default function ReactionsOverlay({ reactions }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      {reactions.map((r) => (
        <div
          key={r.key}
          className="animate-float-up absolute flex flex-col items-center"
          style={{ left: `${r.x}%`, bottom: 8 }}
        >
          <span className="text-3xl">{r.emoji}</span>
          <span className="text-[10px] text-faint">{r.name}</span>
        </div>
      ))}
    </div>
  );
}

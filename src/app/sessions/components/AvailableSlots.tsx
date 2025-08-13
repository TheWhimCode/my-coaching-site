export type Slot = { id: string; startISO: string; durationMin: number; isTaken: boolean };

export default function AvailableSlots({
  slots,
  onPick,
}: {
  slots: Slot[];
  onPick?: (id: string) => void;
}) {
  return (
    <div className="mt-1 grid grid-cols-1 gap-2">
      {slots.map(s => (
        <button
          key={s.id}
          disabled={s.isTaken}
          onClick={() => onPick?.(s.id)}
          className="rounded-xl px-3 py-2 text-sm border border-white/10 hover:border-white/30 disabled:opacity-40 text-left"
          title={new Date(s.startISO).toLocaleString()}
        >
          {new Date(s.startISO).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
        </button>
      ))}
    </div>
  );
}

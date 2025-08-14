export type Slot = { id: string; startTime: string; duration: number; isTaken: boolean };

export async function fetchSlots(from: Date, to: Date): Promise<Slot[]> {
  const r = await fetch(`/api/slots?from=${from.toISOString()}&to=${to.toISOString()}`);
  if (!r.ok) throw new Error("Failed to load slots");
  return r.json();
}

// utils/api.ts
export async function createBooking(p: {
  slotId: string;
  sessionType: string;
  liveMinutes: number;
  discord: string;
  inGame?: boolean;
  followups?: number;
  notes?: string;
}) {
  const r = await fetch("/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(p),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error || "Failed to book");
  return j;
}

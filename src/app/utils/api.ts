export type Slot = { id: string; startTime: string; isTaken: boolean };

// src/app/utils/api
export async function fetchSlots(from: Date, to: Date, liveMinutes = 60): Promise<Slot[]> {
  const qs = new URLSearchParams({
    from: from.toISOString(),
    to: to.toISOString(),
    liveMinutes: String(liveMinutes),
  });
  const res = await fetch(`/api/slots?${qs}`, { cache: "no-store" });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Failed to load slots");
  return data;
}


export async function createCheckout(input: {
  slotId: string;
  sessionType: string;
  liveMinutes: number;
  discord: string;
  inGame?: boolean;
  followups?: number;
}) {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Could not start checkout");
  return data as { url: string };
}

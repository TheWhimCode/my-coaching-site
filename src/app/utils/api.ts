export type Slot = { id: string; startTime: string; isTaken: boolean };

export async function fetchSlots(from: Date, to: Date): Promise<Slot[]> {
  const qs = new URLSearchParams({ from: from.toISOString(), to: to.toISOString() });
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
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify(input),
  });

  const text = await res.text(); // <-- read raw
  let data: any;
  try { data = text ? JSON.parse(text) : undefined; } catch { /* keep raw */ }

  if (!res.ok) {
    throw new Error(data?.error || text || `Checkout failed (${res.status})`);
  }
  if (!data?.url) {
    throw new Error("Server didn't return a checkout URL");
  }
  return data as { url: string };
}


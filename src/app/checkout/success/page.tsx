import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SuccessPage({ searchParams }: { searchParams: { session_id?: string } }) {
  const sid = searchParams.session_id;
  if (!sid) return <div className="p-8 text-white">Missing session_id.</div>;

  // Prefer DB (webhook already saved it). Fallback to Stripe if not found yet.
  let booking = await prisma.booking.findUnique({ where: { stripeSessionId: sid }, include: { slot: true } });

  if (!booking) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
    const s = await stripe.checkout.sessions.retrieve(sid);
    const meta = (s.metadata || {}) as any;
    const slotId = meta.slotId as string | undefined;
    const slot = slotId ? await prisma.slot.findUnique({ where: { id: slotId } }) : null;

    booking = slot && s.amount_total != null ? {
      id: "pending",
      sessionType: meta.sessionType || "Session",
      status: "paid",
      slotId: slot.id,
      liveMinutes: Number(meta.liveMinutes || 60),
      inGame: meta.inGame === "true",
      followups: Number(meta.followups || 0),
      discord: meta.discord || "",
      notes: null,
      createdAt: new Date(),
      stripeSessionId: sid,
      amountCents: s.amount_total ?? undefined,
      currency: (s.currency || "eur") as any,
      blockCsv: (s.metadata?.slotIds as string) || undefined,
      slot,
    } as any : null;
  }

  if (!booking?.slot) return <div className="p-8 text-white">Thanks! We’re finalizing your booking…</div>;

  const when = new Date(booking.slot.startTime).toLocaleString([], { dateStyle: "full", timeStyle: "short" });

  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl font-semibold mb-2">Booking confirmed ✅</h1>
      <p className="text-white/80 mb-6">
        See you on <span className="font-medium">{when}</span>
        {booking.discord ? <> — I’ll ping you on Discord: <span className="font-mono">{booking.discord}</span></> : null}.
      </p>

      <div className="rounded-xl bg-white/[0.03] ring-1 ring-white/10 p-4 space-y-1 text-sm">
        <div><span className="text-white/60">Type:</span> {booking.sessionType}</div>
        <div><span className="text-white/60">Duration:</span> {booking.liveMinutes} min{booking.followups ? ` (+${booking.followups} follow-up${booking.followups>1?"s":""})` : ""}</div>
        {booking.amountCents != null && (
          <div><span className="text-white/60">Paid:</span> {(booking.amountCents/100).toFixed(2)} {booking.currency?.toUpperCase?.() || "EUR"}</div>
        )}
      </div>

      <a href="/sessions/vod-review" className="inline-block mt-6 px-4 py-2 rounded-lg bg-white/10 ring-1 ring-white/15 hover:bg-white/15">
        Book another time
      </a>
    </div>
  );
}

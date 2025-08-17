import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function SuccessPage({
  searchParams,
}: { searchParams: { session_id?: string } }) {
  const sid = searchParams.session_id;
  if (!sid) return <div className="p-8 text-white">Missing session_id.</div>;

  // 1) Prefer DB (saved by webhook)
  let booking = await prisma.booking.findUnique({
    where: { stripeSessionId: sid },
    include: { slot: true },
  });

  // For UI: optional Stripe receipt URL
  let receiptUrl: string | undefined;

  // 2) Fallback to Stripe metadata if DB isn’t populated yet
  if (!booking) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
    const sess = await stripe.checkout.sessions.retrieve(sid, {
      expand: ["payment_intent.latest_charge"],
    });

    receiptUrl = (sess.payment_intent as any)?.latest_charge?.receipt_url as
      | string
      | undefined;

    const meta = (sess.metadata || {}) as Record<string, string>;
    const slotId = meta.slotId;
    const slot = slotId ? await prisma.slot.findUnique({ where: { id: slotId } }) : null;

    if (slot && sess.amount_total != null) {
      booking = {
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
        amountCents: sess.amount_total ?? undefined,
        currency: (sess.currency || "eur") as string,
        blockCsv: meta.slotIds || undefined,
        slot,
      } as any;
    }
  }

  if (!booking?.slot) {
    return (
      <div className="p-8 text-white">
        Thanks! We’re finalizing your booking…
      </div>
    );
  }

  const start = booking.slot.startTime;
  const when = new Date(start).toLocaleString([], {
    dateStyle: "full",
    timeStyle: "short",
  });
  const startISO = booking.slot.startTime.toISOString();
  const liveMinutes = booking.liveMinutes;
  const sessionType = booking.sessionType;

  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl font-semibold mb-2">Booking confirmed ✅</h1>
      <p className="text-white/80">
        See you on <span className="font-medium">{when}</span>
        {booking.discord ? (
          <>
            {" "}
            — I’ll ping you on Discord:{" "}
            <span className="font-mono">{booking.discord}</span>
          </>
        ) : null}
        .
      </p>

      {/* Add to calendar */}
      <div className="mt-3">
        <a
          className="underline"
          href={`/api/ics?title=${encodeURIComponent(
            sessionType
          )}&start=${encodeURIComponent(startISO)}&minutes=${liveMinutes}&location=${encodeURIComponent(
            "Discord"
          )}`}
        >
          Add to calendar (.ics)
        </a>
        {receiptUrl && (
          <>
            <span className="mx-2 text-white/40">•</span>
            <a className="underline" href={receiptUrl} target="_blank">
              View Stripe receipt
            </a>
          </>
        )}
      </div>

      <div className="mt-4 rounded-xl bg-white/[0.03] ring-1 ring-white/10 p-4 space-y-1 text-sm">
        <div>
          <span className="text-white/60">Type:</span> {booking.sessionType}
        </div>
        <div>
          <span className="text-white/60">Duration:</span> {booking.liveMinutes} min
          {booking.followups
            ? ` (+${booking.followups} follow-up${booking.followups > 1 ? "s" : ""})`
            : ""}
        </div>
        {booking.amountCents != null && (
          <div>
            <span className="text-white/60">Paid:</span>{" "}
            {(booking.amountCents / 100).toFixed(2)}{" "}
            {booking.currency?.toUpperCase?.() || "EUR"}
          </div>
        )}
      </div>

      <a
        href="/sessions/vod-review"
        className="inline-block mt-6 px-4 py-2 rounded-lg bg-white/10 ring-1 ring-white/15 hover:bg-white/15"
      >
        Book another time
      </a>
    </div>
  );
}

// src/app/api/stripe/webhook/route.ts
import Stripe from "stripe";
import { prisma } from "@/lib/prisma"; // <- adjust if your alias differs

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) return new Response("Missing signature", { status: 400 });

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const m = (session.metadata ?? {}) as Record<string, string>;

    const slotIds = (m.slotIds ? m.slotIds.split(",") : []).filter(Boolean);
    const firstSlotId = m.slotId || slotIds[0]; // anchor booking

    const sessionType = m.sessionType ?? "Session";
    const liveMinutes = parseInt(m.liveMinutes ?? "60", 10);
    const discord = m.discord ?? "";
    const inGame = m.inGame === "true";
    const followups = parseInt(m.followups ?? "0", 10);

    const amountCents = session.amount_total ?? undefined;
    const currency = (session.currency ?? "eur").toLowerCase();
    const stripeSessionId = session.id;

    try {
      await prisma.$transaction(async (tx) => {
        // 1) Idempotency: record this Stripe event once.
        // If it already exists, exit early (we've processed it before).
        try {
          await tx.processedEvent.create({ data: { id: event.id } });
        } catch {
          return; // already processed
        }

        // 2) Reserve all slices in the block (or the single slot).
        if (slotIds.length > 0) {
          await tx.slot.updateMany({
            where: { id: { in: slotIds } },
            data: { isTaken: true },
          });
        } else if (firstSlotId) {
          await tx.slot.update({
            where: { id: firstSlotId },
            data: { isTaken: true },
          });
        }

        // 3) Upsert booking anchored to the first slot.
        if (firstSlotId) {
          await tx.booking.upsert({
            where: { slotId: firstSlotId },
            update: {
              status: "paid",
              stripeSessionId,
              amountCents,
              currency,
              blockCsv: slotIds.join(","),
            },
            create: {
              sessionType,
              status: "paid",
              slotId: firstSlotId,
              liveMinutes,
              inGame,
              followups,
              discord,
              stripeSessionId,
              amountCents,
              currency,
              blockCsv: slotIds.join(","),
            },
          });
        }
      });
    } catch (e) {
      console.error("WEBHOOK_TX_ERROR:", e);
      // Optional: issue a refund if something failed after payment capture.
      try {
        if (session.payment_intent) {
          await stripe.refunds.create({ payment_intent: String(session.payment_intent) });
        }
      } catch {}
    }
  }

  return new Response("ok", { status: 200 });
}

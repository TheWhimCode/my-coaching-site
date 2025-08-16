import Stripe from "stripe";
import { prisma } from "../../../lib/prisma";
import type { Prisma } from "@prisma/client";

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
    const slotId = m.slotId!;
    const sessionType = m.sessionType ?? "Session";
    const liveMinutes = parseInt(m.liveMinutes ?? "60", 10);
    const discord = m.discord ?? "";
    const inGame = m.inGame === "true";
    const followups = parseInt(m.followups ?? "0", 10);

    try {
      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const updated = await tx.slot.updateMany({
          where: { id: slotId, isTaken: false },
          data: { isTaken: true },
        });
        if (updated.count === 0) throw new Error("SLOT_ALREADY_TAKEN");

        await tx.booking.create({
          data: {
            sessionType,
            slotId,
            liveMinutes,
            discord,
            inGame,
            followups,
            status: "paid",
          },
        });
      });
    } catch (e) {
      try {
        if (session.payment_intent) {
          await stripe.refunds.create({ payment_intent: String(session.payment_intent) });
        }
      } catch {}
    }
  }

  return new Response("ok", { status: 200 });
}

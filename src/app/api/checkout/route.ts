import Stripe from "stripe";
import { z } from "zod";
import { prisma } from "@/app/lib/prisma";              // uses tsconfig path '@/*'
import type { Prisma } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

/* input */
const Body = z.object({
  slotId: z.string(),
  sessionType: z.string(),
  liveMinutes: z.number().int().min(30).max(120),
  discord: z.string().trim().max(64).optional().default(""),
  inGame: z.boolean().optional().default(false),
  followups: z.number().int().min(0).max(4).optional().default(0),
});

/* pricing */
function calcAmountCents({ liveMinutes, followups }: { liveMinutes: number; followups: number }) {
  const base = 50;
  const extra = Math.max(0, liveMinutes - 60) * 0.5;
  const follow = (followups ?? 0) * 10;
  return Math.round((base + extra + follow) * 100);
}

/* block verification (15-min atoms) */
const SLOT_SIZE_MIN = 15;

async function getContiguousBlockIds(
  tx: Prisma.TransactionClient,
  startSlotId: string,
  liveMinutes: number
): Promise<string[] | null> {
  const start = await tx.slot.findUnique({ where: { id: startSlotId } });
  if (!start) return null;

  const need = Math.ceil(liveMinutes / SLOT_SIZE_MIN);
  const end = new Date(start.startTime.getTime() + liveMinutes * 60_000);

  const block = await tx.slot.findMany({
    where: { startTime: { gte: start.startTime, lt: end } },
    orderBy: { startTime: "asc" },
  });

  // type-narrow only what we need
  const rows = block as Array<{ id: string; isTaken: boolean }>;
  if (rows.length !== need) return null;
  if (rows.some((s) => s.isTaken)) return null;
  return rows.map((s) => s.id);
}

/* handler */
export async function POST(req: Request) {
  let json: unknown;
  try { json = await req.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "Invalid body", issues: parsed.error.issues }, { status: 400 });
  }

  const { slotId, sessionType, liveMinutes, discord, inGame, followups } = parsed.data;

  // verify the whole block is free (race-safe)
  const slotIds = await prisma.$transaction(async (tx: Prisma.TransactionClient) =>
    getContiguousBlockIds(tx, slotId, liveMinutes)
  );
  if (!slotIds) return Response.json({ error: "Requested time block is unavailable" }, { status: 409 });

  const first = await prisma.slot.findUnique({ where: { id: slotId } });
  if (!first) return Response.json({ error: "Slot not found" }, { status: 404 });

  const amount = calcAmountCents({ liveMinutes, followups: followups ?? 0 });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [{
      price_data: {
        currency: "eur",
        product_data: {
          name: `${sessionType} (${liveMinutes} min)`,
          description: `Time: ${new Date(first.startTime).toLocaleString()}`,
        },
        unit_amount: amount,
      },
      quantity: 1,
    }],
    success_url: `${process.env.SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.SITE_URL}/checkout/cancel`,
    metadata: {
      slotId,
      slotIds: slotIds.join(","), // full block for webhook
      sessionType,
      liveMinutes: String(liveMinutes),
      discord: discord ?? "",
      inGame: String(!!inGame),
      followups: String(followups ?? 0),
    },
  });

  return Response.json({ url: session.url }, { status: 200 });
}

// src/app/api/paypal/create/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CheckoutZ, computePriceEUR } from "@/lib/pricing";
import { getBlockIds } from "@/lib/booking/block";
import { paypalCreateOrder } from "@/lib/paypal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HOLD_TTL_MIN = 10;

function b64urlJson(obj: unknown) {
  return Buffer.from(JSON.stringify(obj)).toString("base64url");
}

export async function POST(req: Request) {
  // validate body
  const {
    slotId,
    sessionType,
    liveMinutes,
    discord,
    inGame,
    followups,
    liveBlocks, // (metadata only)
    holdKey,
  } = CheckoutZ.parse(await req.json());

  // basic checks
  const slot = await prisma.slot.findUnique({ where: { id: slotId } });
  if (!slot || slot.isTaken) {
    return NextResponse.json({ error: "Slot not found or already taken" }, { status: 409 });
  }

  // hold enforcement/refresh
  const now = new Date();
  if (slot.holdUntil && slot.holdUntil < now) {
    await prisma.slot.update({ where: { id: slotId }, data: { holdUntil: null, holdKey: null } });
    return NextResponse.json({ error: "hold_expired" }, { status: 409 });
  }
  if (slot.holdKey && holdKey && slot.holdKey !== holdKey) {
    return NextResponse.json({ error: "hold_mismatch" }, { status: 409 });
  }
  await prisma.slot.update({
    where: { id: slotId },
    data: {
      holdUntil: new Date(now.getTime() + HOLD_TTL_MIN * 60_000),
      ...(holdKey ? { holdKey } : {}),
    } as any,
  });

  // contiguous block check
  const slotIds = await getBlockIds(slotId, liveMinutes, prisma);
  if (!slotIds?.length) {
    return NextResponse.json({ error: "Selected time isn’t fully available" }, { status: 409 });
  }

  // price
  const { priceEUR, amountCents } = computePriceEUR(liveMinutes, followups);

  // compact, safe metadata (custom_id ≤127 chars)
  let custom = b64urlJson({
    a: slotId,
    b: slotIds.join(","), // block csv
    t: sessionType,
    m: liveMinutes,
    d: discord ?? "",
    g: !!inGame,
    f: followups ?? 0,
    p: priceEUR,
  });
  if (custom.length > 127) custom = custom.slice(0, 127);

  // idempotency to avoid dupes on retry
  const idem = `${slotIds.join("|")}:${amountCents}:paypal`;

  // create order
  const order = await paypalCreateOrder(
    {
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: slotId,
          custom_id: custom,
          amount: { currency_code: "EUR", value: (amountCents / 100).toFixed(2) },
          description: `${sessionType} (${liveMinutes}m)`,
        },
      ],
      application_context: {
        brand_name: "Your Coaching",
        user_action: "PAY_NOW",
        shipping_preference: "NO_SHIPPING",
        return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/cancel`,
      },
    },
    idem
  );

  return NextResponse.json({ id: order.id });
}

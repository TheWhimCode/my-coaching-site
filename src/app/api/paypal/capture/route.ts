// src/app/api/paypal/capture/route.ts
import { NextResponse } from "next/server";
import { paypalCaptureOrder } from "@/lib/paypal";
import { finalizeBooking } from "@/lib/booking/finalizeBooking";
import { prisma } from "@/lib/prisma";
import { sendBookingEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseCustomId(custom_id?: string | null) {
  if (!custom_id) return null;
  try {
    const json = Buffer.from(custom_id, "base64url").toString("utf8");
    return JSON.parse(json) as any;
  } catch {
    // fall back: maybe it was plain JSON
    try { return JSON.parse(custom_id); } catch { return null; }
  }
}

export async function POST(req: Request) {
  const { orderId } = await req.json();
  if (!orderId) return NextResponse.json({ error: "orderId required" }, { status: 400 });

  const data = await paypalCaptureOrder(orderId);

  if (data.status !== "COMPLETED") {
    return NextResponse.json({ error: "not_completed", raw: data }, { status: 400 });
  }

  const pu = data.purchase_units?.[0];
  const custom = parseCustomId(pu?.custom_id);

  // meta for finalizeBooking
  const meta = custom
    ? {
        slotId: String(custom.a ?? ""),
        slotIds: String(custom.b ?? ""),
        sessionType: String(custom.t ?? "Session"),
        liveMinutes: String(custom.m ?? "60"),
        discord: String(custom.d ?? ""),
        inGame: String(!!custom.g),
        followups: String(custom.f ?? "0"),
      }
    : {};

  const cap = pu?.payments?.captures?.[0];
  const amountCents =
    cap?.amount?.value && cap.amount.currency_code
      ? Math.round(parseFloat(cap.amount.value) * 100)
      : undefined;
  const currency = cap?.amount?.currency_code?.toLowerCase() ?? "eur";

  await finalizeBooking(meta, amountCents, currency, orderId, "paypal");

  // try to email payer
  const email = data.payer?.email_address || undefined;
  if (email && (meta.slotId || "").length) {
    const slot = await prisma.slot.findUnique({
      where: { id: String(meta.slotId) },
      select: { startTime: true },
    });
    if (slot) {
      await sendBookingEmail(email, {
        title: meta.sessionType ?? "Coaching Session",
        startISO: slot.startTime.toISOString(),
        minutes: parseInt(meta.liveMinutes ?? "60", 10),
        followups: parseInt(meta.followups ?? "0", 10),
        priceEUR: Math.round((amountCents ?? 0) / 100),
        bookingId: String(meta.slotId),
      });
    }
  }

  return NextResponse.json({ ok: true });
}

// app/api/bookings/route.ts
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
export const runtime = "nodejs";

const prisma = new PrismaClient();

const Body = z.object({
  slotId: z.string(),
  sessionType: z.string(),
  liveMinutes: z.number().int().min(15).max(120),
  discord: z.string().min(2).max(64),
  inGame: z.boolean().optional().default(false),
  followups: z.number().int().min(0).max(4).optional().default(0),
  notes: z.string().max(500).optional(),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) {
    return Response.json({ error: "Invalid body" }, { status: 400 });
  }
  const { slotId, sessionType, liveMinutes, discord, inGame, followups, notes } = parsed.data;

  try {
    const booking = await prisma.$transaction(async (tx) => {
      const updated = await tx.slot.updateMany({
        where: { id: slotId, isTaken: false },
        data: { isTaken: true },
      });
      if (updated.count === 0) throw new Error("SLOT_NOT_FOUND_OR_TAKEN");

      return tx.booking.create({
        data: {
          sessionType,
          slotId,
          liveMinutes,
          discord,
          inGame: !!inGame,
          followups: followups ?? 0,
          ...(notes ? { notes } : {}),
        },
      });
    });

    return Response.json(booking, { status: 201 });
  } catch (e: any) {
    if (e?.message === "SLOT_NOT_FOUND_OR_TAKEN") {
      return Response.json({ error: "Slot not found or already taken" }, { status: 409 });
    }
    console.error("BOOKINGS_POST_ERROR:", e);
    return Response.json({ error: "Unknown error" }, { status: 500 });
  }
}

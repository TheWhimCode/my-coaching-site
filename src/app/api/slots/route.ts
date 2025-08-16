import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { canStartHere, guards, getConfig } from "@/lib/booking/block";
import { rateLimit } from "@/middleware/rateLimit";

export const runtime = "nodejs"; // <-- stays at top-level

const QuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  liveMinutes: z.coerce.number().int().min(30).max(120).optional().default(60),
});

export async function GET(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "local";
  if (!rateLimit(`slots:${ip}`, 60, 60_000)) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const parse = QuerySchema.safeParse({
    from: searchParams.get("from") || undefined,
    to: searchParams.get("to") || undefined,
    liveMinutes: searchParams.get("liveMinutes") || undefined,
  });
  if (!parse.success) {
    return Response.json({ error: "Invalid query" }, { status: 400 });
  }

  const now = new Date();
  const { minStart, maxStart, isWithinHours } = guards(now);
  const { PER_DAY_CAP } = getConfig();

  const from = parse.data.from ? new Date(parse.data.from) : now;
  const to = parse.data.to
    ? new Date(parse.data.to)
    : new Date(from.getTime() + 7 * 24 * 60 * 60 * 1000);
  const liveMinutes = parse.data.liveMinutes;

  const candidates = await prisma.slot.findMany({
    where: {
      startTime: { gte: from, lt: to },
      isTaken: false,
    },
    orderBy: { startTime: "asc" },
    select: { id: true, startTime: true, isTaken: true },
  });

  const filtered = [];
  let perDayCount: Record<string, number> = {};

  for (const s of candidates) {
    const start = s.startTime;

    if (start < minStart || start >= maxStart) continue;
    if (!isWithinHours(start)) continue;

    const dayKey = start.toISOString().slice(0, 10);
    if (PER_DAY_CAP > 0) {
      perDayCount[dayKey] = perDayCount[dayKey] || 0;
      if (perDayCount[dayKey] >= PER_DAY_CAP) continue;
    }

    const ok = await canStartHere(s.id, liveMinutes, prisma);
    if (!ok) continue;

    filtered.push({
      id: s.id,
      startTime: s.startTime.toISOString(),
      isTaken: false,
    });
    if (PER_DAY_CAP > 0) perDayCount[dayKey]! += 1;
  }

  return Response.json(filtered);
}

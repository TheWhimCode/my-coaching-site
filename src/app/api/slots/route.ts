import { PrismaClient } from "@prisma/client";
import { z } from "zod";
export const runtime = 'nodejs';


const prisma = new PrismaClient();

const QuerySchema = z.object({
  from: z.string().optional(), // ISO date
  to: z.string().optional(),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parse = QuerySchema.safeParse({
    from: searchParams.get("from") || undefined,
    to: searchParams.get("to") || undefined,
  });
  if (!parse.success) return Response.json({ error: "Invalid query" }, { status: 400 });

  const from = parse.data.from ? new Date(parse.data.from) : new Date();
  const to = parse.data.to ? new Date(parse.data.to) : new Date(from.getTime() + 7 * 24 * 60 * 60 * 1000);

  const slots = await prisma.slot.findMany({
    where: { startTime: { gte: from, lt: to } },
    orderBy: { startTime: "asc" },
  });

  return Response.json(slots);
}
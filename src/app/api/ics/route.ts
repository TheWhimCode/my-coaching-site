import { randomUUID } from "crypto";
import { z } from "zod";

export const runtime = "nodejs";

const Query = z.object({
  title: z.string().trim().default("Coaching Session"),
  start: z.string().trim(),                 // ISO datetime (UTC or local)
  minutes: z.coerce.number().int().min(1).max(600).default(60),
  location: z.string().trim().optional(),
  description: z.string().trim().optional(),
});

function fmtUTC(d: Date) {
  // -> 20250817T161500Z
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}
function icsEscape(s: string) {
  // RFC5545 escapes
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export async function GET(req: Request) {
  const u = new URL(req.url);
  const parsed = Query.safeParse({
    title: u.searchParams.get("title") ?? undefined,
    start: u.searchParams.get("start") ?? undefined,
    minutes: u.searchParams.get("minutes") ?? undefined,
    location: u.searchParams.get("location") ?? undefined,
    description: u.searchParams.get("description") ?? undefined,
  });
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Invalid query" }), { status: 400 });
  }

  const { title, start, minutes, location, description } = parsed.data;

  const startDate = new Date(start);
  if (isNaN(startDate.getTime())) {
    return new Response(JSON.stringify({ error: "Invalid start datetime" }), { status: 400 });
  }
  const endDate = new Date(startDate.getTime() + minutes * 60_000);

  const dtstamp = fmtUTC(new Date());
  const dtstart = fmtUTC(startDate);
  const dtend   = fmtUTC(endDate);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//your-site//coaching//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${randomUUID()}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${icsEscape(title)}`,
    description ? `DESCRIPTION:${icsEscape(description)}` : undefined,
    location ? `LOCATION:${icsEscape(location)}` : undefined,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);

  const ics = lines.join("\r\n") + "\r\n";

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="booking.ics"`,
      "Cache-Control": "no-store",
    },
  });
}

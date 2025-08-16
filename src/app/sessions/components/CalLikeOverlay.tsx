"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { motion } from "framer-motion";
import { createCheckout, fetchSlots } from "../../utils/api";
import type { Slot } from "../../utils/api";

/* ---------- utils ---------- */

// Display window / rules for starts
const AVAIL = {
  hoursStart: 13,        // 13:00 inclusive
  hoursEnd: 24,          // 24:00 exclusive
  minuteStarts: [0, 30], // starts allowed at :00 and :30
  minLeadMinutes: 240,   // hide anything < 4h from now
  maxAdvanceDays: 45,    // don’t show beyond 45 days out
};

function toISOMinute(d: Date) {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 16) + ":00.000Z";
}
function dateKey(d: Date) {
  return format(d, "yyyy-MM-dd");
}
// window check (don’t filter on minuteStarts here!)
function isWithinWindow(local: Date) {
  const now = new Date();
  const diffMs = local.getTime() - now.getTime();
  const leadOk = diffMs >= AVAIL.minLeadMinutes * 60_000;
  const maxOk  = diffMs <= AVAIL.maxAdvanceDays * 86_400_000;
  const h = local.getHours();
  const hourOk = h >= AVAIL.hoursStart && h < AVAIL.hoursEnd;
  return leadOk && maxOk && hourOk;
}

/* ---------- props ---------- */
type Props = {
  sessionType: string;
  liveMinutes: number;    // drives contiguous requirement
  inGame?: boolean;
  followups?: number;
  onClose?: () => void;
};

export default function CalLikeOverlay({
  sessionType,
  liveMinutes,
  inGame = false,
  followups = 0,
  onClose,
}: Props) {
  // month being viewed
  const [month, setMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  // remote slots
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // selection
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [selectedSlotISO, setSelectedSlotISO] = useState<string | null>(null);

  // discord & submit state
  const [discord, setDiscord] = useState("");
  const [dErr, setDErr] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function isDiscordValid(s: string) {
    const t = s.trim();
    if (!t) return true; // optional
    return /^@?[a-z0-9._-]{2,32}$/i.test(t) || /^.{2,32}#\d{4}$/.test(t);
  }
  const discordOk = isDiscordValid(discord);

  // fetch a padded month of slots
  useEffect(() => {
    let ignore = false;
    const from = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const to = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchSlots(from, to);
        if (!ignore) setSlots(data);
      } catch (e: any) {
        if (!ignore) setError(e?.message || "Failed to load availability");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => { ignore = true; };
  }, [month]);

  /* ---------------- core logic: contiguous starts ---------------- */

  // All free quarter-hours per day, within window
  const freeByDay = useMemo(() => {
    const map = new Map<string, { id: string; local: Date }[]>();
    for (const s of slots) {
      if (s.isTaken) continue;
      const local = new Date(s.startTime);
      if (!isWithinWindow(local)) continue;
      const key = dateKey(local);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push({ id: s.id, local });
    }
    for (const arr of map.values()) arr.sort((a,b)=>a.local.getTime()-b.local.getTime());
    return map;
  }, [slots]);

  // For the month grid: mark a day available only if it has ≥1 valid start
  const validStartCountByDay = useMemo(() => {
    const need = Math.ceil(liveMinutes / 15);
    const out = new Map<string, number>();
    for (const [key, arr] of freeByDay.entries()) {
      const freeSet = new Set(arr.map(x => +x.local));
      let count = 0;
      for (const s of arr) {
        // enforce starts at :00 / :30 only
        if (!AVAIL.minuteStarts.includes(s.local.getMinutes())) continue;
        let ok = true;
        for (let i = 0; i < need; i++) {
          if (!freeSet.has(+s.local + i * 15 * 60_000)) { ok = false; break; }
        }
        if (ok) count++;
      }
      if (count > 0) out.set(key, count);
    }
    return out;
  }, [freeByDay, liveMinutes]);

  // For right pane: list only valid starts for the selected day
  const validStartsForSelected = useMemo(() => {
    if (!selectedDate) return [];
    const need = Math.ceil(liveMinutes / 15);
    const day = freeByDay.get(dateKey(selectedDate)) ?? [];
    const freeSet = new Set(day.map(x => +x.local));

    return day.filter(s => {
      if (!AVAIL.minuteStarts.includes(s.local.getMinutes())) return false;
      for (let i = 0; i < need; i++) {
        if (!freeSet.has(+s.local + i * 15 * 60_000)) return false;
      }
      return true;
    });
  }, [selectedDate, freeByDay, liveMinutes]);

  // Month matrix (6 weeks view)
  const monthMatrix = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    const days: Date[] = [];
    const cur = new Date(start);
    while (cur <= end) {
      days.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return days;
  }, [month]);

  async function submitBooking() {
    if (!selectedSlotId) return;
    if (!discordOk) {
      setDErr("Enter a valid Discord handle");
      return;
    }
    setDErr(null);
    setPending(true);
    try {
      const { url } = await createCheckout({
        slotId: selectedSlotId,
        sessionType,
        liveMinutes,
        discord: discord.trim(),
        inGame,
        followups,
      });
      if (!url) throw new Error("No checkout URL returned");
      window.location.assign(url);
    } catch (e: any) {
      setDErr(e?.message || "Could not start checkout");
    } finally {
      setPending(false);
    }
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm grid place-items-center">
      <div className="w-[92vw] max-w-[1200px] h-[88vh] rounded-2xl overflow-hidden ring-1 ring-white/10 bg-neutral-950 shadow-2xl flex flex-col">
        {/* header */}
        <div className="px-6 pt-5 pb-3 flex items-center justify-between">
          <div className="text-white/85">
            <div className="text-[11px] uppercase tracking-[0.18em] text-white/60">
              Schedule
            </div>
            <div className="text-xl font-semibold">{sessionType}</div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:block text-xs text-white/50">
              {Intl.DateTimeFormat().resolvedOptions().timeZone}
            </div>
            <input
              value={discord}
              onChange={(e) => setDiscord(e.target.value)}
              placeholder="Discord username (optional)"
              className="w-[260px] rounded-lg bg-neutral-900 px-3 py-2 text-sm ring-1 ring-white/10 outline-none focus:ring-white/20 text-white"
            />
          </div>
        </div>

        {/* body */}
        <div className="px-6 pb-4 flex-1 min-h-0">
          <div className="h-full grid grid-cols-1 md:grid-cols-[1.1fr_1.4fr] gap-6">
            {/* left: month */}
            <div className="relative rounded-2xl ring-1 ring-white/10 bg-white/[0.02] p-4">
              <div className="pointer-events-none absolute -inset-px rounded-2xl blur-xl opacity-50"
                   style={{ background: "linear-gradient(135deg, rgba(34,211,238,0.18), rgba(99,102,241,0.16))" }} />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => setMonth((m) => addMonths(m, -1))}
                    className="h-9 px-3 rounded-lg bg-white/10 hover:bg-white/15 ring-1 ring-white/20 text-white/90"
                  >
                    ←
                  </button>
                  <div className="text-white font-semibold">
                    {format(month, "MMMM yyyy")}
                  </div>
                  <button
                    onClick={() => setMonth((m) => addMonths(m, 1))}
                    className="h-9 px-3 rounded-lg bg-white/10 hover:bg-white/15 ring-1 ring-white/20 text-white/90"
                  >
                    →
                  </button>
                </div>

                {loading ? (
                  <div className="h-[300px] grid place-items-center text-white/60">
                    Loading…
                  </div>
                ) : error ? (
                  <div className="h-[300px] grid place-items-center text-rose-400">
                    {error}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-7 text-center text-[11px] text-white/60 mb-1">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                        <div key={d}>{d}</div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                      {monthMatrix.map((d) => {
                        const key = dateKey(d);
                        const hasAvail = (validStartCountByDay.get(key) ?? 0) > 0;
                        const selected = selectedDate && isSameDay(d, selectedDate);
                        const outside = !isSameMonth(d, month);
                        const today = isToday(d);

                        return (
                          <button
                            key={key}
                            disabled={!hasAvail}
                            onClick={() => {
                              setSelectedDate(d);
                              setSelectedSlotId(null);
                              setSelectedSlotISO(null);
                            }}
                            className={[
                              "aspect-square rounded-lg text-sm ring-1 ring-white/10 transition-all",
                              outside ? "opacity-45" : "",
                              hasAvail
                                ? "bg-white/[0.03] hover:bg-white/[0.08]"
                                : "bg-white/[0.02] cursor-not-allowed",
                              selected ? "ring-2 ring-cyan-400/70 bg-cyan-400/10" : "",
                            ].join(" ")}
                          >
                            <div className="flex h-full w-full items-center justify-center relative">
                              <span className="text-white/90">{format(d, "d")}</span>
                              {today && (
                                <span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-cyan-300" />
                              )}
                              {hasAvail && !selected && (
                                <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-emerald-300" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* right: times */}
            <div className="relative rounded-2xl ring-1 ring-white/10 bg-white/[0.02] p-4 flex flex-col">
              <div className="text-white/80 font-medium mb-3">
                {selectedDate ? (
                  <>Available times on <span className="text-white">{format(selectedDate, "EEE, MMM d")}</span></>
                ) : (
                  "Select a day to see times"
                )}
              </div>

              <div className="relative flex-1 min-h-0 overflow-auto rounded-xl ring-1 ring-white/10 bg-neutral-950/60">
                {!selectedDate ? (
                  <div className="h-full grid place-items-center text-white/50 text-sm">
                    Pick a day on the left
                  </div>
                ) : validStartsForSelected.length === 0 ? (
                  <div className="h-full grid place-items-center text-white/60 text-sm">
                    No times available for this day.
                  </div>
                ) : (
                  <ul className="p-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {validStartsForSelected.map(({ id, local }) => {
                      const isActive = selectedSlotId === id;
                      const label = local.toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                      });
                      return (
                        <li key={id}>
                          <button
                            onClick={() => {
                              setSelectedSlotId(id);
                              setSelectedSlotISO(toISOMinute(local));
                            }}
                            className={[
                              "w-full px-3 py-2 rounded-lg text-sm ring-1 transition",
                              isActive
                                ? "ring-cyan-400/70 bg-cyan-400/15 text-white"
                                : "ring-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-white/90",
                            ].join(" ")}
                          >
                            {label}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <div className="mt-3 text-[12px] text-white/50">
                Times are shown in your timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
              </div>
            </div>
          </div>
        </div>

        {/* footer */}
        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between gap-3">
          {dErr && <div className="text-rose-400 text-sm">{dErr}</div>}
          <div className="ml-auto flex gap-2">
            <button
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 ring-1 ring-white/15 text-white"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white"
              disabled={!selectedSlotId || pending}
              onClick={submitBooking}
            >
              {pending ? "Redirecting…" : "Book & pay"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

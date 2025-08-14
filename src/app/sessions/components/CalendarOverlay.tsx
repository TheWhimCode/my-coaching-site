// src/app/sessions/components/CalendarOverlay.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { addWeeks, endOfWeek, format, startOfWeek } from "date-fns";
import { motion } from "framer-motion";
import { createBooking, fetchSlots } from "../../utils/api"; // ← use your alias
import type { Slot } from "../../utils/api";

type Props = {
  sessionType: string;
  liveMinutes: number;
  inGame?: boolean;
  followups?: number;
  onClose?: () => void;
};

export default function CalendarOverlay({
  sessionType,
  liveMinutes,
  inGame = false,
  followups = 0,
  onClose,
}: Props) {
  // step/state
  const [step, setStep] = useState<1 | 2>(1);
  const [discord, setDiscord] = useState("");
  const [dErr, setDErr] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // week/slots
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const weekEnd = useMemo(
    () => endOfWeek(weekStart, { weekStartsOn: 1 }),
    [weekStart]
  );
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchSlots(weekStart, weekEnd);
        if (!ignore) setSlots(data);
      } catch (e: any) {
        if (!ignore) setError(e.message || "Failed to load slots");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [weekStart, weekEnd]);

  function isDiscordValid(s: string) {
    const t = s.trim();
    // allow @newhandles or legacy Name#1234
    return /^@?[a-z0-9._-]{2,32}$/i.test(t) || /^.{2,32}#\d{4}$/.test(t);
  }

  async function submitBooking() {
    if (!selectedId) return;
    if (!isDiscordValid(discord)) {
      setDErr("Enter a valid Discord handle");
      return;
    }
    try {
      // Optimistic: mark taken
      setSlots((xs) => xs.map((x) => (x.id === selectedId ? { ...x, isTaken: true } : x)));
      await createBooking({
        slotId: selectedId,
        sessionType,
        liveMinutes,
        discord: discord.trim(),
        inGame,
        followups,
      });
      onClose?.();
    } catch (e: any) {
      // Roll back
      setSlots((xs) => xs.map((x) => (x.id === selectedId ? { ...x, isTaken: false } : x)));
      setDErr(e?.message || "Booking failed. Please try again.");
    }
  }

  const discordOk = isDiscordValid(discord);

  return (
    <div className="fixed inset-0 bg-black/50 z-50">
      <div className="absolute inset-y-0 right-0 w-full md:w-[900px] bg-neutral-950 text-white p-4 md:p-6 overflow-hidden">
        <motion.div
          animate={{ x: step === 1 ? 0 : "-100%" }}
          transition={{ type: "spring", stiffness: 500, damping: 40 }}
          className="flex w-[200%] h-full"
        >
          {/* STEP 1: calendar */}
          <div className="w-1/2 pr-4 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">
                {format(weekStart, "MMM d")} – {format(weekEnd, "MMM d")}
              </div>
              <div className="space-x-2">
                <button
                  className="px-3 py-2 rounded bg-neutral-800 hover:bg-neutral-700"
                  onClick={() => setWeekStart((w) => addWeeks(w, -1))}
                >
                  ← Prev
                </button>
                <button
                  className="px-3 py-2 rounded bg-neutral-800 hover:bg-neutral-700"
                  onClick={() => setWeekStart((w) => addWeeks(w, 1))}
                >
                  Next →
                </button>
              </div>
            </div>

            <div className="mt-4 flex-1 overflow-auto">
              {loading ? (
                <div className="p-6 text-neutral-400">Loading…</div>
              ) : error ? (
                <div className="p-6 text-red-400">{error}</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                  {Array.from({ length: 7 }).map((_, i) => {
                    const day = new Date(weekStart.getTime() + i * 86400000);
                    const daySlots = slots.filter((s) => {
                      const d = new Date(s.startTime);
                      return (
                        d.getFullYear() === day.getFullYear() &&
                        d.getMonth() === day.getMonth() &&
                        d.getDate() === day.getDate()
                      );
                    });

                    return (
                      <div key={i} className="border border-neutral-800 rounded p-2">
                        <div className="text-sm text-neutral-400 mb-2">
                          {format(day, "EEE dd")}
                        </div>
                        <div className="space-y-2">
                          {daySlots.length === 0 && (
                            <div className="text-neutral-600 text-sm">No times</div>
                          )}
                          {daySlots.map((s) => {
                            const t = new Date(s.startTime);
                            const label = t.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            });
                            const disabled = s.isTaken;
                            const active = selectedId === s.id;
                            return (
                              <button
                                key={s.id}
                                disabled={disabled}
                                onClick={() => setSelectedId(s.id)}
                                className={[
                                  "w-full text-left px-2 py-2 rounded border",
                                  disabled
                                    ? "opacity-40 cursor-not-allowed border-neutral-800"
                                    : active
                                    ? "border-emerald-500 bg-emerald-500/10"
                                    : "hover:border-neutral-600 border-neutral-800",
                                ].join(" ")}
                              >
                                {label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-neutral-800 hover:bg-neutral-700"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50"
                disabled={!selectedId}
                onClick={() => setStep(2)}
              >
                Book date →
              </button>
            </div>
          </div>

          {/* STEP 2: discord */}
          <div className="w-1/2 pl-4 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">Your Discord</div>
              <div className="space-x-2">
                <button
                  className="px-3 py-2 rounded bg-neutral-800 hover:bg-neutral-700"
                  onClick={() => setStep(1)}
                >
                  ← Back
                </button>
              </div>
            </div>

            <div className="mt-4">
              <label className="text-sm text-white/80">Discord username</label>
              <input
                value={discord}
                onChange={(e) => {
                  setDiscord(e.target.value);
                  setDErr(null);
                }}
                placeholder="@username or Name#1234"
                className="mt-2 w-full rounded-md bg-neutral-900 ring-1 ring-white/10 px-3 py-2 outline-none focus:ring-white/20"
                autoComplete="off"
              />
              {dErr && <div className="mt-2 text-sm text-red-400">{dErr}</div>}
              <p className="mt-2 text-xs text-white/60">
                Sessions run on Discord. You can also join from the site header.
              </p>
            </div>

            <div className="mt-auto flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-neutral-800 hover:bg-neutral-700"
                onClick={() => setStep(1)}
              >
                Back
              </button>
              <button
                className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50"
                disabled={!selectedId || !discordOk}
                onClick={submitBooking}
              >
                Continue to checkout
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

"use client";
import { motion } from "framer-motion";

type Props = {
  title: string;
  minutes: number;                 // total live minutes (30–120)
  priceEUR: number;                // static price for the top card (e.g., 50)
  liveBlocks?: number;             // count of 45m in-game blocks
  followups?: number;              // shown detached below (doesn’t affect height)
  extraPriceEUR?: number;          // static price for the “Extra time” slab (e.g., 10)
  liveGamePriceEUR?: number;       // static price for the “Live game” slab (e.g., 40)
  isActive?: boolean;
  background?: "transparent" | "panel";
  className?: string;
  layoutId?: string;
};

export default function SessionBlock({
  title,
  minutes,
  priceEUR,
  liveBlocks = 0,
  followups = 0,
  extraPriceEUR = 10,
  liveGamePriceEUR = 40,
  isActive = false,
  background = "transparent",
  className = "",
  layoutId,
}: Props) {
  // ----- time math
  const m = Math.max(30, Math.min(120, minutes));
  const extraMin = Math.max(0, m - 60);                   // time beyond base 60
  const lgCount = Math.min(liveBlocks, Math.floor(extraMin / 45));
  const extraAfterLive = Math.max(0, extraMin - lgCount * 45); // 0..30

  // ----- visual sizing
  // Base block height scales from 100px (30m) to 200px (60m+)
  const BASE_MIN_H = 100;
  const BASE_MAX_H = 200;
  const baseH =
    m <= 60
      ? Math.round(BASE_MIN_H + ((m - 30) / 30) * (BASE_MAX_H - BASE_MIN_H))
      : BASE_MAX_H;

  // Slabs derive from the *current* base height:
  // 15m == 1/4 of base; 45m == 3/4 of base
  const h15 = Math.max(8, Math.round(baseH / 4));
  const h45 = Math.max(24, Math.round((baseH * 3) / 4));

  const hExtra = Math.round((extraAfterLive / 15) * h15); // middle slab
  const hLive = Math.round(lgCount * h45);                // bottom slab
  const hasExtra = hExtra > 0 || hLive > 0;
const extraIsBottom = hExtra > 0 && hLive === 0;

  return (
    <motion.div
      layoutId={layoutId}
      layout
      transition={{ type: "spring", stiffness: 600, damping: 48 }}
      className={[
        "relative rounded-2xl",
        background === "panel" ? "bg-white/6 ring-1 ring-white/15 p-4" : "p-0",
        className,
      ].join(" ")}
    >
      {/* outer shell */}
      <div
        className={[
          "relative ring-1 ring-white/12 overflow-hidden",
        // when we attach slabs, keep bottom square; only the very bottom slab rounds
          hasExtra ? "rounded-t-xl" : "rounded-xl",
        ].join(" ")}
      >
        <div className="absolute inset-0 bg-white/[0.06]" />

        {/* BASE (scales with minutes) */}
        <motion.div
          layout
          style={{ height: baseH }}
          className="relative z-10 px-5 pt-5 pb-4 flex flex-col justify-between"
          transition={{ type: "spring", stiffness: 600, damping: 42 }}
        >
          <div>
            <div className="text-xs uppercase tracking-wide text-white/70">Session</div>
            <div className="mt-1 text-2xl font-extrabold">{title}</div>
          </div>

          <div className="flex items-center justify-between text-sm font-semibold">
            <span>{m} min</span>
            <span>€{priceEUR}</span>  {/* static top price */}
          </div>
        </motion.div>

        {/* ATTACHED SLABS */}
        {hasExtra && (
          <div className="relative z-10 flex flex-col">
            {/* Extra time slab (middle) */}
            {hExtra > 0 && (
              <motion.div
                layout
                initial={{ height: 0, opacity: 0.6 }}
                animate={{ height: hExtra, opacity: 1 }}
                exit={{ height: 0, opacity: 0.6 }}
                transition={{ type: "spring", stiffness: 700, damping: 42 }}
                style={{ transformOrigin: "top" }}
    className={[
      "w-full border-t border-white/10 bg-gradient-to-r from-fuchsia-500/40 to-rose-500/35",
      extraIsBottom ? "rounded-b-xl" : ""   // ← round if it's the bottom-most
    ].join(" ")}              >
                <div className="h-full px-5 flex items-end justify-between pb-3 text-white font-semibold">
                  <span>Extra time</span>
                  <span>€{extraPriceEUR}</span>
                </div>
              </motion.div>
            )}

            {/* Live game slab (bottom) */}
            {hLive > 0 && (
              <motion.div
                layout
                initial={{ height: 0, opacity: 0.6 }}
                animate={{ height: hLive, opacity: 1 }}
                exit={{ height: 0, opacity: 0.6 }}
                transition={{ type: "spring", stiffness: 700, damping: 42 }}
                style={{ transformOrigin: "top" }}
    className="w-full border-t border-white/10 bg-gradient-to-r from-cyan-400/40 to-sky-500/35 rounded-b-xl"
              >
                <div className="h-full px-5 flex items-end justify-between pb-3 text-white font-semibold">
                  <span>Live game</span>
                  <span>€{liveGamePriceEUR}</span>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* outer glow */}
        <motion.div
          className="pointer-events-none absolute -inset-2 rounded-2xl blur-xl"
          style={{
            background:
              "linear-gradient(90deg, rgba(34,211,238,.25), rgba(59,130,246,.25), rgba(139,92,246,.25))",
          }}
          animate={{ opacity: isActive ? 0.6 : 0.15 }}
          transition={{ duration: 0.25 }}
        />
      </div>

      {/* Detached follow-ups (don’t change merged height) */}
      {followups > 0 && (
        <div className="px-5 pt-2 pb-4 text-xs text-white/80">
          + {followups} × 15-min follow-up (delivered later)
        </div>
      )}
    </motion.div>
  );
}

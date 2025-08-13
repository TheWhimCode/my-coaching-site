"use client";
import { motion, AnimatePresence } from "framer-motion";
import SessionBlock from "@/app/sessions/components/SessionBlock";


export default function CenterSessionPanel({
  title = "VOD Review",
  baseMinutes,
  basePriceEUR,
  extraMinutes = 0,
  totalPriceEUR,
  isCustomizing = false,
}: {
  title?: string;
  baseMinutes: number;
  basePriceEUR: number;   // kept for future, not shown separately now
  extraMinutes?: number;
  totalPriceEUR: number;
  isCustomizing?: boolean;
}) {
  const totalMinutes = baseMinutes + extraMinutes;

  return (
<div className="relative w-full max-w-md h-full flex flex-col">
      {/* Shell */}
      <motion.div
        initial={false}
        animate={
          isCustomizing
            ? { boxShadow: "0 0 0 1px rgba(255,255,255,0.22)" }
            : { boxShadow: "0 0 0 1px rgba(255,255,255,0.12)" }
        }
        className="rounded-2xl bg-white/6 backdrop-blur-md ring-1 ring-white/15 p-6"
      >
                <SessionBlock
          title={title}
          minutes={totalMinutes}
          priceEUR={totalPriceEUR}
          isActive={isCustomizing}
          locked
          className="mb-5"  // spacing below the card
          // layoutId="session-block"  // (optional) for future slide animation
        />
        {/* Top summary (glows when customizing) */}
        <motion.div
          initial={false}
          animate={isCustomizing ? { background: "rgba(255,255,255,0.06)" } : { background: "transparent" }}
          className="rounded-xl p-4 border border-white/10 relative overflow-hidden"
        >
          {/* subtle animated rim when customizing */}
          <motion.div
            initial={false}
            animate={isCustomizing ? { opacity: 1 } : { opacity: 0 }}
            className="pointer-events-none absolute -inset-3 rounded-2xl blur-2xl"
            style={{
              background:
                "linear-gradient(90deg, rgba(34,211,238,.18), rgba(59,130,246,.18), rgba(139,92,246,.18))",
            }}
          />
          <div className="relative z-10">
            <div className="text-sm uppercase tracking-wide text-white/70">Session</div>
            <div className="mt-1 text-2xl font-extrabold">{title}</div>

            {/* Inline duration & price */}


          </div>
        </motion.div>

        {/* Info text (hidden when customizing) */}
        <AnimatePresence initial={false} mode="wait">
          {!isCustomizing ? (
            <motion.div
              key="info"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.2 }}
              className="mt-5 text-sm text-white/85 space-y-3"
            >
              <p>Get timestamped insights on your gameplay, a clear action plan, and follow-ups.</p>
              <ul className="space-y-2">
                <li>• Send VOD + goals</li>
                <li>• Live review + notes</li>
                <li>• Action plan & next steps</li>
              </ul>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

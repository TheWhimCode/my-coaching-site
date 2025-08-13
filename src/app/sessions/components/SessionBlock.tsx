// app/sessions/components/SessionBlock.tsx
"use client";
import { motion } from "framer-motion";

type Props = {
  title: string;          // e.g. "VOD Review"
  minutes: number;        // total minutes
  priceEUR: number;       // total price
  isActive?: boolean;     // glow when CustomizeDrawer is open
  locked?: boolean;       // locked (not draggable yet)
  className?: string;     // optional extra spacing
  layoutId?: string;      // optional, for future slide animation
};

export default function SessionBlock({
  title,
  minutes,
  priceEUR,
  isActive = false,
  locked = true,
  className = "",
  layoutId,
}: Props) {
  return (
    <motion.div
      layoutId={layoutId}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-xl p-4 border border-white/10
                  bg-transparent backdrop-blur-md ring-0 ${className}
                  ${locked ? "cursor-default" : "cursor-grab"}`}
      style={{ boxShadow: isActive ? "0 0 24px rgba(59,130,246,.35)" : "none" }}
    >
      {/* glow rim when active */}
      <motion.div
        initial={false}
        animate={{ opacity: isActive ? 1 : 0 }}
        className="pointer-events-none absolute -inset-3 rounded-2xl blur-2xl"
        style={{
          background:
            "linear-gradient(90deg, rgba(34,211,238,.18), rgba(59,130,246,.18), rgba(139,92,246,.18))",
        }}
      />

      <div className="relative z-10">
        <div className="text-sm uppercase tracking-wide text-white/70">Session</div>
        <div className="mt-1 text-2xl font-extrabold">{title}</div>

        {/* duration ◆ price */}
        <div className="mt-3 flex items-center gap-2 text-sm">
          <span className="font-semibold">{minutes} min</span>
          <span className="text-white/50">◆</span>
          <span className="font-semibold">€{priceEUR}</span>
        </div>
      </div>
    </motion.div>
  );
}

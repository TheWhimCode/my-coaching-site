"use client";
import { motion, AnimatePresence } from "framer-motion";

type Preset = { id: string; label: string; minutes: number; extra?: string };

export default function CenterSessionPanel({
  title = "VOD Review",
  baseMinutes,
  basePriceEUR,
  extraMinutes = 0,
  totalPriceEUR,
  isCustomizing = false,
  onCustomize,
  onQuickAdd15,                  // e.g., adds +15 min
  onClearExtras,
  onPickPreset,                  // apply a preset
  presets = [
    { id: "sig", label: "Signature", minutes: 60, extra: "+15 offline" },
    { id: "quick", label: "Quick", minutes: 30 },
    { id: "deep", label: "Deep Dive", minutes: 90 },
  ] as Preset[],
}: {
  title?: string;
  baseMinutes: number;
  basePriceEUR: number;
  extraMinutes?: number;
  totalPriceEUR: number;
  isCustomizing?: boolean;
  onCustomize: () => void;
  onQuickAdd15: () => void;
  onClearExtras: () => void;
  onPickPreset: (presetId: string) => void;
  presets?: Preset[];
}) {
  const totalMinutes = baseMinutes + extraMinutes;

  return (
    <div className="relative w-full max-w-md">
      {/* Shell */}
      <motion.div
        initial={false}
        animate={isCustomizing ? { boxShadow: "0 0 0 1px rgba(255,255,255,0.2)" } : { boxShadow: "0 0 0 1px rgba(255,255,255,0.12)" }}
        className="rounded-2xl bg-white/6 backdrop-blur-md ring-1 ring-white/15 p-6"
      >
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

            <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                <div className="text-white/70 text-xs">Duration</div>
                <div className="font-semibold">{totalMinutes} min</div>
              </div>
              <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                <div className="text-white/70 text-xs">Base</div>
                <div className="font-semibold">€{basePriceEUR}</div>
              </div>
              <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                <div className="text-white/70 text-xs">Total</div>
                <div className="font-semibold">€{totalPriceEUR}</div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={onCustomize}
                className="rounded-xl px-4 py-2 text-sm font-medium bg-white/10 hover:bg-white/15 ring-1 ring-white/15 transition"
              >
                Custom session
              </button>
              <div className="text-xs text-white/65">
                or book the default <span className="font-medium">{baseMinutes} min</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Middle content: when NOT customizing, show approachable info;
            when customizing, fade it out and reveal controls below */}
        <div className="mt-5">
          <AnimatePresence initial={false} mode="wait">
            {!isCustomizing ? (
              <motion.div
                key="info"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.2 }}
                className="text-sm text-white/85 space-y-3"
              >
                <p>Get timestamped insights on your gameplay, a clear action plan, and follow-ups.</p>
                <ul className="space-y-2">
                  <li>• Send VOD + goals</li>
                  <li>• Live review + notes</li>
                  <li>• Action plan & next steps</li>
                </ul>
              </motion.div>
            ) : (
              <motion.div
                key="custom"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Presets */}
                <div>
                  <div className="text-xs uppercase tracking-wide text-white/60 mb-2">Presets</div>
                  <div className="grid grid-cols-2 gap-2">
                    {presets.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => onPickPreset(p.id)}
                        className="h-12 rounded-xl border border-white/15 bg-white/7 hover:bg-white/12 text-left px-3"
                      >
                        <div className="text-sm font-medium">{p.label}</div>
                        <div className="text-[11px] text-white/70">
                          {p.minutes} min{p.extra ? ` • ${p.extra}` : ""}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick add minutes */}
                <div>
                  <div className="text-xs uppercase tracking-wide text-white/60 mb-2">Quick add</div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={onQuickAdd15}
                      className="h-10 rounded-xl border border-white/15 bg-white/8 hover:bg-white/12 px-3 text-sm"
                    >
                      +15 min
                    </button>
                    <button
                      onClick={onClearExtras}
                      className="h-10 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-3 text-sm"
                    >
                      Clear extras
                    </button>
                    <div className="text-xs text-white/70 ml-auto">
                      Extra: <span className="font-semibold">{extraMinutes} min</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

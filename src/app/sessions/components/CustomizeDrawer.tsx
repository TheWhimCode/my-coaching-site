"use client";
import { motion, AnimatePresence } from "framer-motion";

type AddOn = { id: string; minutes: number; price: number };
type Props = {
  open: boolean; onClose: () => void;
  baseMinutes: number; maxExtra: number; currentExtra: number;
  onAdd: (a: AddOn) => void; onClear: () => void;
};

const PRESETS: AddOn[] = [
  { id: "extra-15", minutes: 15, price: 15 },
  { id: "extra-30", minutes: 30, price: 25 },
  { id: "extra-60", minutes: 60, price: 45 },
];

export default function CustomizeDrawer({
  open, onClose, baseMinutes, maxExtra, currentExtra, onAdd, onClear,
}: Props) {
  const remaining = Math.max(0, maxExtra - currentExtra);
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/60" onClick={onClose} />
          <motion.aside
            className="absolute left-0 top-0 h-full w-[min(380px,88vw)] bg-neutral-900/90 backdrop-blur ring-1 ring-white/10 p-5 text-white"
            initial={{ x: -24, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            exit={{ x: -24, opacity: 0 }} transition={{ duration: 0.18 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Customize session</h3>
              <button onClick={onClose} className="text-white/70 hover:text-white">✕</button>
            </div>

            <p className="text-sm text-white/80 mb-4">
              Base: {baseMinutes} min • Add up to <b>{maxExtra} min</b>.
            </p>

            <div className="space-y-3">
              {PRESETS.map(p => {
                const disabled = p.minutes > remaining;
                return (
                  <button key={p.id}
                    disabled={disabled}
                    onClick={() => onAdd(p)}
                    className={`w-full rounded-xl px-4 py-3 text-left ring-1 ring-white/10
                      ${disabled ? "bg-white/5 text-white/40 cursor-not-allowed"
                                 : "bg-white/10 hover:bg-white/15"}`}>
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Bonus time</div>
                      <div className="text-sm text-white/85">
                        +{p.minutes} min • +€{p.price}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 text-xs text-white/70">Remaining: {remaining} min</div>

            <button onClick={onClear}
              className="mt-4 text-sm underline text-white/80 hover:text-white">
              Clear add-ons
            </button>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

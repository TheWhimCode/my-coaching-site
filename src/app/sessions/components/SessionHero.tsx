"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import AvailableSlots, { Slot } from "./AvailableSlots";
import CenterSessionPanel from "@/app/sessions/components/CenterSessionPanel";

// --- CTA-sized, non-clickable step pill ---
function StepPill({ i, text }: { i: number; text: string }) {
  return (
    <div
      aria-disabled
      className="select-none rounded-xl border border-white/15 bg-white/5
                 px-6 py-5 min-h-[72px] flex items-center gap-4 ring-1 ring-white/10"
    >
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full
                       bg-white/10 ring-1 ring-white/15 text-sm font-semibold">
        {i}
      </span>
      <span className="text-base text-white/90">{text}</span>
    </div>
  );
}

type Props = {
  title: string;
  subtitle: string;
  image: string;
  children?: ReactNode;
  showHint?: boolean;
  onHintClick?: () => void;
  howItWorks?: string[];
  onCustomize?: () => void;
  onBookNow?: () => void;
  slots?: Slot[];
  onPickSlot?: (id: string) => void;
  baseMinutes?: number;
  basePriceEUR?: number;
  extraMinutes?: number;
  totalPriceEUR?: number;
  isCustomizingCenter?: boolean;
    liveBlocks?: number;
  followups?: number;
};

export default function SessionHero({
  title,
  subtitle,
  image,
  showHint,
  onHintClick,
  howItWorks,
  onCustomize,
  slots,
  onPickSlot,
  baseMinutes = 60,
  basePriceEUR = 50,
  extraMinutes = 0,
  totalPriceEUR = 50,
  isCustomizingCenter = false,
    liveBlocks = 0,
  followups = 0,
  onBookNow,
}: Props) {
  return (
    <section className="relative isolate h-[100svh] overflow-hidden text-white vignette">
      {/* Background stack */}
      <div className="absolute inset-0 bg-hero-gradient" />
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1100px] h-44 opacity-20 blur-sm rounded-t-2xl"
        style={{
          backgroundImage: `url(${image})`,
          backgroundSize: "cover",
          backgroundPosition: "50% 35%",
        }}
      />
      <div className="absolute inset-0 hud-grid" />
      <div className="absolute inset-0 scanlines" />
      <div className="absolute inset-0 noise" />

      {/* === 2-row grid === */}
<div
   className="relative z-10 mx-auto max-w-7xl px-6 md:px-8
              grid gap-7 items-start content-center min-h-full
              md:grid-rows-[auto_auto] md:grid-cols-[1.05fr_1.1fr_.95fr]"
 >
      
        {/* Row 1 — Headline (Col 1 only) */}
        <div className="md:row-[1] md:col-[1]">
          <h1 className="text-6xl font-extrabold leading-tight whitespace-nowrap md:text-6xl lg:text-7xl">
            {title}
          </h1>
          <p className="mt-2 text-white/80 text-xl">{subtitle}</p>
        </div>
        {/* (Intentionally no content in Row 1 Col 2/3 so the title doesn't affect card heights) */}

        {/* Row 2 — Left card: Steps */}
        <div className="md:row-[2] md:col-[1] ">
          <div className=" rounded-2xl bg-white/6 backdrop-blur-md ring-1 ring-white/15 p-7">
            {howItWorks?.length ? (
              <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
                {howItWorks.map((t, idx) => (
                  <StepPill key={idx} i={idx + 1} text={t} />
                ))}
                {/* Filler placeholders */}
                <StepPill i={(howItWorks.length ?? 0) + 1} text="Pick a time slot" />
                <StepPill i={(howItWorks.length ?? 0) + 2} text="Get your action plan" />
              </div>
            ) : null}
          </div>
        </div>

        {/* Row 2 — Center card: Session panel */}
        <div className="md:row-[2] md:col-[2] ">
          <div className="">
<CenterSessionPanel
  title={title}
  baseMinutes={baseMinutes}
  basePriceEUR={basePriceEUR}
  extraMinutes={extraMinutes}
  totalPriceEUR={totalPriceEUR}
  isCustomizing={isCustomizingCenter}
  liveBlocks={liveBlocks}
  followups={followups}
/>

          </div>
        </div>

        {/* Row 2 — Right card: CTA + slots */}
        <div className="md:row-[2] md:col-[3]">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className=""
          >
            <div className=" rounded-2xl bg-white/6 backdrop-blur-md ring-1 ring-white/15 p-5 flex flex-col gap-3">
              <button onClick={onBookNow} className="w-full rounded-xl px-5 py-3 text-base font-semibold bg-emerald-500 hover:bg-emerald-600 transition shadow-md">
                Book now
              </button>

              {onCustomize && (
                <button
                  onClick={onCustomize}
                  className="w-full rounded-xl px-5 py-3 text-base font-medium bg-white/10 hover:bg-white/15 ring-1 ring-white/15 transition"
                >
                  Customize
                </button>
              )}

              {slots?.length ? (
                <>
                  <div className="mt-1 text-xs text-white/70">Next available</div>
                  <AvailableSlots slots={slots} onPick={onPickSlot} />
                </>
              ) : null}

              <p className="text-xs text-white/70 mt-auto">Secure checkout (Stripe).</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

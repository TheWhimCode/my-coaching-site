"use client";

import { useEffect, useRef, useState } from "react";
import SessionHero from "@/app/sessions/components/SessionHero";
import SessionTiles from "@/app/sessions/components/SessionTiles";
import SessionExample from "@/app/sessions/components/SessionExample";
import CustomizeDrawer from "../components/CustomizeDrawer";
import SessionTestimonialsSection from "@/app/sessions/components/SessionTestimonialsSection";
import CalendarOverlay from "@/app/sessions/components/CalendarOverlay";
import { LayoutGroup, AnimatePresence } from "framer-motion";
import type { Cfg } from "../../utils/sessionConfig";

export default function VODReviewPage() {
  // UI state
  const [showIncluded, setShowIncluded] = useState(false);
  const [showHint, setShowHint] = useState(false);



    // ✅ New session customization state
  type AddOn = { id: string; minutes: number; price: number };
  const MAX_EXTRA_MIN = 120;
const [cfg, setCfg] = useState<Cfg>({ liveMin: 60, liveBlocks: 0, followups: 0 });

  const [session, setSession] = useState({
    type: "vod-review",
    baseMinutes: 60,
    basePrice: 50,
    addons: [] as AddOn[],
  });

  // Derived totals
  const extraMinutes = session.addons.reduce((s, a) => s + a.minutes, 0);
  const extraPrice   = session.addons.reduce((s, a) => s + a.price, 0);
  const totalMinutes = session.baseMinutes + extraMinutes;
  const [drawerOpen, setDrawerOpen] = useState(false);
const totalPrice   = session.basePrice + extraPrice;
const MAX_SESSION_MINUTES = 120;
const [calendarOpen, setCalendarOpen] = useState(false);
  type Slot = { id: string; startISO: string; durationMin: number; isTaken: boolean };

const exampleSlots: Slot[] = [
  { id: "s1", startISO: "2025-08-13T17:00:00+02:00", durationMin: 60, isTaken: false },
  { id: "s2", startISO: "2025-08-13T19:00:00+02:00", durationMin: 60, isTaken: true },
  { id: "s3", startISO: "2025-08-14T18:00:00+02:00", durationMin: 60, isTaken: false },
];

  
  // Handlers for customization
const addAddon = (a: AddOn) => {
  const totalAfter = session.baseMinutes + extraMinutes + a.minutes;
  if (totalAfter > MAX_SESSION_MINUTES) return; // block if over max
  setSession(s => ({ ...s, addons: [...s.addons, a] }));
};
  const clearAddons = () => setSession(s => ({ ...s, addons: [] }));
const calcPrice = (c: Cfg) => 50 + Math.max(0, c.liveMin - 60) * 0.5 + c.liveBlocks * 10 + c.followups * 10;


  // Show “Need more info?” after a short delay; hide on first interaction
  useEffect(() => {
    const t = setTimeout(() => setShowHint(true), 3000);
    const hide = () => setShowHint(false);
    window.addEventListener("scroll", hide, { once: true });
    window.addEventListener("pointerdown", hide, { once: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", hide);
      window.removeEventListener("pointerdown", hide);
    };
  }, []);

  const scrollToDetails = () => {
    document.getElementById("details")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  
  return (
    <LayoutGroup id="booking-flow">
    <main className="relative min-h-screen text-white overflow-x-hidden">
<SessionHero
  title="VOD Review"
  subtitle="League of Legends gameplay analysis"
  image="/videos/vod-review-poster-end.png"
  showHint={showHint}
  onHintClick={scrollToDetails}
  onCustomize={() => setDrawerOpen(true)}
  howItWorks={[
    "Send your VOD + goals",
    "Live review + timestamped notes",
    "Action plan & follow-ups",
  ]}
  slots={exampleSlots}
  onPickSlot={() => setDrawerOpen(true)}
  isCustomizingCenter={drawerOpen}
baseMinutes={cfg.liveMin}
extraMinutes={0}
totalPriceEUR={calcPrice(cfg)}
liveBlocks={cfg.liveBlocks} 
followups={cfg.followups}

  onBookNow={() => setCalendarOpen(true)}
/>

{/* Mount/unmount the overlay so Framer can animate the shared element */}
<AnimatePresence>
{calendarOpen && (
  <CalendarOverlay
    sessionType="VOD Review"
    liveMinutes={cfg.liveMin}
    inGame={cfg.liveBlocks > 0}
    followups={cfg.followups}
    onClose={() => setCalendarOpen(false)}
  />
)}

</AnimatePresence>


<CustomizeDrawer
  open={drawerOpen}
  onClose={() => setDrawerOpen(false)}
  cfg={cfg}
  onChange={setCfg}
/>





      {/* This is the blue/purple gradient that sits behind all sections below */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-indigo-950 via-blue-950 to-violet-950" />

      <SessionTiles />

<section id="details"
  className="scroll-mt-24 mx-auto max-w-6xl px-6 py-10 grid md:grid-cols-2 gap-8 items-start">
  <div>
    <h2 className="text-2xl font-bold mb-4">What you get</h2>
    <ul className="flex flex-col gap-3 text-white/85 text-sm">
      <li>✔ Profile review & goals</li>
      <li>✔ Strengths & weaknesses breakdown</li>
      <li>✔ Timestamped notes + action plan</li>
      <li>✔ Personal 3-step improvement path</li>
    </ul>
  </div>

  <SessionExample
    youtubeUrl="https://www.youtube.com/embed/NMu6PjdTIgk"
    className="justify-self-end max-w-[420px]" 
  />
</section>



  

<SessionTestimonialsSection sessionType="vod-review" />

      {/* Mini overlay: "What's included" */}
      {showIncluded && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60">
          <div className="w-[min(520px,92vw)] rounded-2xl bg-neutral-900/90 ring-1 ring-white/10 p-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold">What’s included</h3>
              <button onClick={() => setShowIncluded(false)} className="text-white/70 hover:text-white">✕</button>
            </div>
            <ul className="space-y-2 text-white/85 text-sm">
              <li>✔ Profile review & goals</li>
              <li>✔ Strengths & weaknesses breakdown</li>
              <li>✔ Timestamped notes + action list</li>
              <li>✔ 3-step personal improvement plan</li>
            </ul>
          </div>
        </div>
      )}
    </main>
    </LayoutGroup>
  );
}
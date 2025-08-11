"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";


// --- Data --------------------------------------------------------------
const SESSIONS = [
  { slug: "vod-review", title: "VOD review", subtitle: "in-depth gameplay analysis", duration: 60,  badge: "most informative session",
    bg: { from: "from-indigo-700", via: "via-blue-700", to: "to-violet-700" },
    cardGradient: "bg-gradient-to-br from-indigo-500 via-blue-600 to-violet-700" },
  { slug: "signature", title: "Signature session", subtitle: "deep dive + tailored roadmap", duration: 90, badge: "best overall",
    bg: { from: "from-fuchsia-700", via: "via-rose-700", to: "to-amber-700" },
    cardGradient: "bg-gradient-to-br from-fuchsia-500 via-rose-600 to-amber-500" },
  { slug: "quick-20", title: "Quick 20 min", subtitle: "rapid-fire fixes & priorities", duration: 20, badge: "fastest feedback",
    bg: { from: "from-emerald-700", via: "via-teal-700", to: "to-cyan-700" },
    cardGradient: "bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600" },
  { slug: "bootcamp", title: "Custom bootcamp", subtitle: "multi-session improvement arc", duration: 120, badge: "max improvement",
    bg: { from: "from-sky-700", via: "via-blue-800", to: "to-slate-800" },
    cardGradient: "bg-gradient-to-br from-sky-500 via-blue-600 to-slate-700" },
];

const TINT_BY_SLUG: Record<string, string> = {
  "vod-review": "hsl(220 90% 55%)",   // blue
  "signature":  "hsl(30 90% 55%)",    // amber
  "quick-20":   "hsl(160 70% 45%)",   // teal
  "bootcamp":   "hsl(270 70% 60%)",   // violet
};



// Video preview sources (put files in /public/videos)
const VIDEO_SRC: Record<string, string> = {
  "vod-review": "/videos/Placeholder-bg.mp4",
  "signature":  "/videos/signature-preview.mp4",
  "quick-20":   "/videos/quick-20-preview.mp4",
  "bootcamp":   "/videos/bootcamp-preview.mp4",
};
const POSTER_SRC: Record<string, string> = {
  "vod-review": "/videos/vod-review-poster.jpg",
  "signature":  "/videos/signature-poster.jpg",
  "quick-20":   "/videos/quick-20-poster.jpg",
  "bootcamp":   "/videos/bootcamp-poster.jpg",
};


// --- Helpers -----------------------------------------------------------
const clampIndex = (i: number) => (i + SESSIONS.length) % SESSIONS.length;
const SLIDE_VARIANTS = {
  enter: (direction: number) => ({ x: direction > 0 ? 24 : -24, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -24 : 24, opacity: 0 }),
} as const;

export default function Page() {
  const router = useRouter();
  const pathname = usePathname();
  const [index, setIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [direction, setDirection] = useState(0);
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [hoverCard, setHoverCard] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const ROTATE_MS = 4500;
  const [isVisible, setIsVisible] = useState(true);
  const [isFocused, setIsFocused] = useState(true);

useEffect(() => {
  const onVis = () => setIsVisible(!document.hidden);
  document.addEventListener("visibilitychange", onVis);
  return () => document.removeEventListener("visibilitychange", onVis);
}, []);

useEffect(() => {
  const onFocus = () => setIsFocused(true);
  const onBlur  = () => setIsFocused(false);
  window.addEventListener("focus", onFocus);
  window.addEventListener("blur", onBlur);
  return () => {
    window.removeEventListener("focus", onFocus);
    window.removeEventListener("blur", onBlur);
  };
}, []);


  // Auto-rotate (pause on hover)
useEffect(() => {
  if (intervalRef.current) clearInterval(intervalRef.current);

  const shouldRun = isVisible && isFocused && !isHovering && !openSlug;
  if (shouldRun) {
    intervalRef.current = setInterval(() => {
      setDirection(1);
      setIndex(i => i + 1);
    }, ROTATE_MS);
  }

  return () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };
}, [isVisible, isFocused, isHovering, openSlug]);

useEffect(() => {
  if (!openSlug) return;
  const href = `/sessions/${openSlug}`;

  // ensure it actually starts playing
  videoRef.current?.play().catch(() => {});

  const id = setTimeout(() => {
    const t = videoRef.current?.currentTime ?? 0;      // capture frame now
    sessionStorage.setItem(`vidTime:${openSlug}`, String(t));
    router.push(href, { scroll: false });
  }, 320); // ≈ morph time
  return () => clearTimeout(id);
}, [openSlug]);


// B) Close overlay as soon as URL matches (instant hide)
useEffect(() => {
  if (openSlug && pathname === `/sessions/${openSlug}`) {
    setOpenSlug(null);
  }
}, [pathname, openSlug]);

  // Derived
  const bg = useMemo(() => SESSIONS[clampIndex(index)].bg, [index]);

  // Keyboard nav
useEffect(() => {
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") { setHasInteracted(true); go(-1); }
    if (e.key === "ArrowRight") { setHasInteracted(true); go(1); }
  };
  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}, []);


  const go = (dir: -1 | 1) => { setHasInteracted(true); setDirection(dir); setIndex((i) => i + dir); };
  const active = SESSIONS[clampIndex(index)];

  return (
    <main
      className="relative min-h-[100dvh] w-full overflow-hidden text-white"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Persistent background that only changes hue */}
{/* base image stays put */}
<div className="absolute inset-0 -z-10 bg-[url('/bg/base.jpg')] bg-cover bg-center" />

{/* animated color tint on top */}
<motion.div
  className="absolute inset-0 -z-10 mix-blend-color"
  animate={{ backgroundColor: TINT_BY_SLUG[active.slug] }}
  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
  style={{ opacity: 0.9 }}
/>

{/* optional dark vignette for readability */}
<div className="pointer-events-none absolute inset-0 -z-10 bg-black/30" />

      {/* Content */}
      <section className="mx-auto flex h-[100dvh] max-w-7xl flex-col items-center justify-center px-4">



        <motion.section
  initial={{ opacity: 0, y: 12, scale: 0.985 }}
  animate={{ opacity: 1, y: 0, scale: 1 }}
  transition={{ duration: 0.5, ease: [0.22,1,0.36,1] }}
  className="mx-auto h-[100dvh] max-w-7xl flex items-center justify-center px-4"
>

        {/* Carousel */}
<div className="relative flex w-full items-center justify-center overflow-hidden pt-12 pb-20">
  {/* Dots above the card */}
  <div className="absolute top-6 z-30 flex items-center gap-2">
    {SESSIONS.map((_, i) => (
      <button
        key={i}
        onClick={() => { setHasInteracted(true); setDirection(i > clampIndex(index) ? 1 : -1); setIndex(i); }}
        className={`h-1.5 rounded-full transition-all ${
   clampIndex(index) === i ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70"
 }`}
      />
    ))}
  </div>


{/* Row: arrows tight to the card */}
<div className="flex items-center gap-2 sm:gap-4">
  {/* Left arrow (chevron lines) */}
  <button
    onPointerDown={(e) => e.stopPropagation()}
    aria-label="Previous"
    onClick={() => go(-1)}
    className="group p-2 sm:p-3 text-white/70 hover:text-white transition"
  >
    <svg viewBox="0 0 12 16" className="h-10 sm:h-12 w-auto transition-transform group-hover:-translate-x-0.5">
      <polyline points="9,1 3,8 9,15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </button>

  {/* Card */}
  <div className="relative flex w-full items-center justify-center overflow-hidden">
    <AnimatePresence initial={false} custom={direction} mode="wait">
      {(() => {
        const s = active;
        return (
          <motion.button
            layoutId={`card-${s.slug}`}
            key={s.slug}
            onMouseEnter={() => router.prefetch(`/sessions/${s.slug}`)}
            custom={direction}
            variants={SLIDE_VARIANTS}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ x: { type: "tween", duration: 0.28, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: 0.2 } }}
            onHoverStart={() => setHoverCard(true)}
            onHoverEnd={() => setHoverCard(false)}
            onClick={() => setOpenSlug(s.slug)}
            whileHover={{ y: -4 }}
            className="relative w-[92vw] max-w-[500px] h-[20vh] min-h-[300px] rounded-[4px] p-[1px] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.75)] overflow-hidden"
          >
            {/* Preview image */}
            <div className="absolute inset-0 overflow-hidden rounded-[4px]">
              {(hoverCard || openSlug === s.slug) && POSTER_SRC[s.slug] && (
                <img src={POSTER_SRC[s.slug]} alt="" className="h-full w-full object-cover" draggable={false} />
              )}
            </div>

            {/* Gradient overlay fades on hover/open */}
            <motion.div
              className={`absolute inset-0 rounded-[4px] ${s.cardGradient}`}
              initial={false}
              animate={{ opacity: (hoverCard || openSlug === s.slug) ? 0.6 : 1 }}
            />

            {/* Content */}
            <div className="relative h-full w-full p-6 sm:p-10 flex flex-col justify-between">
              <div className="text-left">
                <div className="mb-2 text-3xl font-extrabold sm:text-3xl">{s.title}</div>
                <div className="mb-6 text-base text-white/85 sm:text-md">{s.subtitle}</div>
              </div>
              <div className="flex items-center gap-6 text-sm sm:text-base">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-white" />
                  <span className="font-semibold">{s.duration} min</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-300">★</span>
                  <span className="text-white/90">{s.badge}</span>
                </div>
              </div>
            </div>
          </motion.button>
        );
      })()}
    </AnimatePresence>
  </div>

  {/* Right arrow (chevron lines) */}
  <button
    onPointerDown={(e) => e.stopPropagation()}
    aria-label="Next"
    onClick={() => go(1)}
    className="group p-2 sm:p-3 text-white/70 hover:text-white transition"
  >
    <svg viewBox="0 0 12 16" className="h-10 sm:h-12 w-auto transition-transform group-hover:translate-x-0.5">
      <polyline points="3,1 9,8 3,15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </button>
</div>


  {/* Helper text below the card */}
  {!hasInteracted && (
   <motion.p
     className="absolute bottom-4 w-full text-center text-3xl md:text-4xl text-white/90 pointer-events-none"
     initial={{ opacity: 0 }}
     animate={{ opacity: [0, 0.5, 0] }}  // 50% → 0%
     transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
   >
     Choose your preferred coaching session
   </motion.p>
 )}
</div>
</motion.section>


        {/* Overlay morph from the card */}
        <AnimatePresence>
  {openSlug && (
    <motion.div className="fixed inset-0 z-50" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
      <div className="absolute inset-0 bg-black/60" />
      <motion.div layoutId={`card-${openSlug}`} className="absolute inset-0 rounded-none overflow-hidden">
        <video
          ref={videoRef}
          src={VIDEO_SRC[openSlug]}
          className="h-full w-full object-cover"
          muted
          playsInline
          autoPlay
          preload="none"
        />
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

      </section>
    </main>
  );
}

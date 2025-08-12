"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";



export default function VODReviewPage() {


  // UI state
  const [showIncluded, setShowIncluded] = useState(false);
  const [showHint, setShowHint] = useState(false);

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

  const scrollToMore = () => {
    document.getElementById("more")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
     <main className="relative min-h-screen text-white overflow-x-hidden">

 {/* HERO — full-bleed video */}
<section className="relative isolate h-[100svh] overflow-hidden">
  {/* BG image fills the section */}
  <Image
    src="/videos/vod-review-poster-end.png"
    alt=""
    fill
    priority
    sizes="100vw"
    className="object-cover object-[50%_35%]"  // 👈 focus point
  />

  {/* Dark scrim */}
  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/15 via-black/30 to-black/45" />


  {/* Width-limited content on top of the video */}
  <div className="relative mx-auto flex h-full max-w-6xl items-center px-6 py-12">
    <div className="grid w-full grid-cols-1 items-center gap-8 md:grid-cols-3">
      {/* Left: title + chips */}
      <motion.div
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
  className="relative mx-auto flex min-h-[100dvh] max-w-6xl items-center px-6 py-12"
>
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">VOD Review</h1>
          <p className="text-sm md:text-base text-white/80">League of Legends gameplay analysis</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {["Clear priorities", "Timestamped notes", "3-step plan"].map((t) => (
            <span key={t} className="rounded-full bg-white/10 px-3 py-1 text-xs md:text-sm text-white/85 ring-1 ring-white/10">
              {t}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Center: glowing time block */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
        className="flex items-center justify-center"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="relative mx-auto w-[min(440px,86vw)] rounded-2xl p-[2px] bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500"
        >
          <div className="rounded-2xl bg-black/60 backdrop-blur p-6 text-center ring-1 ring-white/10">
            <div className="flex items-center justify-center gap-3">
              <span className="text-4xl md:text-5xl font-extrabold tracking-tight">60 min</span>
              <button
                aria-label="What’s included"
                onClick={() => setShowIncluded(true)}
                className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/15 grid place-items-center ring-1 ring-white/10"
              >
                i
              </button>
            </div>
            <p className="mt-2 text-white/70 text-sm">VOD review • most informative</p>
          </div>
          <div className="pointer-events-none absolute -inset-3 rounded-3xl blur-2xl bg-gradient-to-r from-cyan-400/20 via-blue-500/20 to-violet-500/20" />
        </motion.div>
      </motion.div>

      {/* Right: CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        className="space-y-4 md:justify-self-stretch md:sticky md:top-8"
      >
        <div className="rounded-xl bg-white/8 ring-1 ring-white/10 p-4 text-sm text-white/85">
          <div>⏱ 60 mins</div>
          <div>💰 35€</div>
        </div>
        <Link
          href="/sessions/vod-review/schedule"
          className="block text-center bg-emerald-500 hover:bg-emerald-600 text-white font-semibold w-full py-3 rounded-xl transition"
        >
          Book Now
        </Link>
        <button className="block text-center bg-white/10 hover:bg-white/15 text-white w-full py-3 rounded-xl transition">
          Customize
        </button>
        <div className="bg-gray-900/60 backdrop-blur rounded-xl p-4 text-white/80 text-sm ring-1 ring-white/10">
          <p>"Biggest skill jump I’ve had in years!" – Former Student</p>
        </div>
      </motion.div>
    </div>

    {/* Hint button */}
    {showHint && (
      <motion.button
        onClick={scrollToMore}
        className="fixed bottom-6 right-6 z-40 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur px-4 py-2 text-sm font-medium ring-1 ring-white/15"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
      >
        Need more info →
      </motion.button>
    )}
  </div>
</section>


<div className="relative">
  {/* This is the blue/purple gradient that sits behind all sections below */}
  <div className="absolute inset-0 -z-10 bg-gradient-to-b from-indigo-950 via-blue-950 to-violet-950" />

      {/* TILES (anchor) */}
      <section id="more" className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <a href="#what" className="group rounded-2xl ring-1 ring-white/10 bg-white/5 hover:bg-white/8 p-5 transition">
            <div className="text-lg font-semibold mb-1">What you get</div>
            <p className="text-white/70 text-sm">Exactly what’s included.</p>
          </a>
          <a href="#example" className="group rounded-2xl ring-1 ring-white/10 bg-white/5 hover:bg-white/8 p-5 transition">
            <div className="text-lg font-semibold mb-1">Example session</div>
            <p className="text-white/70 text-sm">60–90s highlight clip.</p>
          </a>
          <a href="#testimonials" className="group rounded-2xl ring-1 ring-white/10 bg-white/5 hover:bg-white/8 p-5 transition">
            <div className="text-lg font-semibold mb-1">Testimonials</div>
            <p className="text-white/70 text-sm">Real results & ranks.</p>
          </a>
          <a href="#how" className="group rounded-2xl ring-1 ring-white/10 bg-white/5 hover:bg-white/8 p-5 transition">
            <div className="text-lg font-semibold mb-1">How it works</div>
            <p className="text-white/70 text-sm">3 simple steps.</p>
          </a>
        </div>
      </section>

      {/* SECTIONS (placeholders to fill later) */}
      <section id="what" className="mx-auto max-w-6xl px-6 py-10">
        <h2 className="text-2xl font-bold mb-4">What you get</h2>
        <ul className="grid sm:grid-cols-2 gap-3 text-white/85 text-sm">
          <li>✔ Profile review & goals</li>
          <li>✔ Strengths & weaknesses breakdown</li>
          <li>✔ Timestamped notes + action plan</li>
          <li>✔ Personal 3-step improvement path</li>
        </ul>
      </section>

      <section id="example" className="mx-auto max-w-6xl px-6 py-10">
        <h2 className="text-2xl font-bold mb-4">Example session</h2>
        <div className="aspect-video w-full rounded-xl overflow-hidden ring-1 ring-white/10 bg-black/30 flex items-center justify-center">
          <span className="text-white/50 text-sm">[Embed short clip or thumbnail → modal]</span>
        </div>
      </section>

      <section id="testimonials" className="mx-auto max-w-6xl px-6 py-10">
        <h2 className="text-2xl font-bold mb-4">Testimonials</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-4 text-white/85 text-sm">
            “Biggest skill jump I’ve had in years!” — Platinum Evelynn
          </div>
          {/* more cards… */}
        </div>
      </section>

      <section id="how" className="mx-auto max-w-6xl px-6 py-10">
        <h2 className="text-2xl font-bold mb-4">How it works</h2>
        <ol className="grid sm:grid-cols-3 gap-4 text-white/85 text-sm">
          <li className="rounded-xl bg-white/5 ring-1 ring-white/10 p-4">1. Send your VOD + goals</li>
          <li className="rounded-xl bg-white/5 ring-1 ring-white/10 p-4">2. Live review + timestamped notes</li>
          <li className="rounded-xl bg-white/5 ring-1 ring-white/10 p-4">3. Action plan & follow-ups</li>
        </ol>
      </section>
</div>
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
    
  );
}

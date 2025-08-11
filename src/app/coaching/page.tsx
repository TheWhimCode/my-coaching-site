"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Card = { id: string; title: string; minutes: number; price: number };

const CARDS: Card[] = [
  { id: "card-1", title: "Card 1", minutes: 60, price: 35 },
  { id: "card-2", title: "Card 2", minutes: 45, price: 40 },
  { id: "card-3", title: "Card 3", minutes: 20, price: 18 },
  { id: "card-4", title: "Card 4", minutes: 90, price: 70 },
];

export default function Coaching() {
  const [index, setIndex] = useState(0);
  const router = useRouter();

  // auto-rotate
  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % CARDS.length), 3500);
    return () => clearInterval(t);
  }, []);

  const go = (dir: -1 | 1) =>
    setIndex((i) => (i + dir + CARDS.length) % CARDS.length);

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-4xl">
        {/* Carousel viewport */}
        <div className="relative overflow-hidden">
          {/* Slides row */}
          <div
            className="flex transition-transform duration-500"
            style={{ transform: `translateX(calc(50% - ${(index + 0.5) * 100}%))` }}
          >
            {CARDS.map((c, i) => {
              const active = i === index;
              return (
                <button
                  key={c.id}
                  onClick={() => router.push(`/session/${c.id}`)}
                  className={[
                    "shrink-0 w-[72%] sm:w-[60%] md:w-[56%] lg:w-[50%] mx-[10%] md:mx-[8%] lg:mx-[6%]",
                    "rounded-2xl border border-white/15 bg-gradient-to-br from-[#1f2a44] to-[#0f1324]",
                    "shadow-2xl hover:shadow-[0_0_50px_rgba(59,130,246,0.35)]",
                    "transition-all duration-300 cursor-pointer",
                    active ? "scale-100" : "scale-95 opacity-80",
                  ].join(" ")}
                >
                  <div className="p-6 md:p-8 text-left">
                    <h3 className="text-2xl md:text-3xl font-bold">{c.title}</h3>
                    <p className="text-white/60 mt-1">placeholder subtitle</p>
                    <div className="mt-6 text-sm md:text-base space-y-1">
                      <div>⏱ {c.minutes} min</div>
                      <div>💰 €{c.price}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Arrows */}
          <button
            aria-label="Previous"
            onClick={() => go(-1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 transition grid place-items-center"
          >
            ‹
          </button>
          <button
            aria-label="Next"
            onClick={() => go(1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 transition grid place-items-center"
          >
            ›
          </button>

          {/* Dots */}
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-10 flex items-center gap-2">
            {CARDS.map((_, i) => (
              <div
                key={i}
                className={
                  i === index
                    ? "h-1.5 w-8 rounded-full bg-white"
                    : "h-1.5 w-1.5 rounded-full bg-white/40"
                }
              />
            ))}
          </div>
        </div>

        {/* Helper text */}
        <p className="text-center mt-16 text-white/60">
          Choose your preferred coaching session
        </p>
      </div>
    </main>
  );
}

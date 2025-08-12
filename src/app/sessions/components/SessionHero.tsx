import { ReactNode } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

type Props = {
  title: string;
  subtitle: string;
  image: string;
  children?: ReactNode;          // glowing blocks go here
  showHint?: boolean;
  onHintClick?: () => void;
  howItWorks?: string[];
  onCustomize?: () => void;
};

export default function SessionHero({
  title,
  subtitle,
  image,
  children,
  showHint,
  onHintClick,
  howItWorks,
  onCustomize,
}: Props) {
  return (
    <section className="relative isolate h-[100svh] overflow-hidden text-white">
      {/* BG */}
      <Image
        src={image}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[50%_35%] select-none"
      />

      {/* Stronger scrim + vignette */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-black/35 to-black/60" />
      <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(80%_80%_at_50%_40%,black,transparent_70%)] bg-black/20" />

      {/* Subtle HUD grid */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,rgba(255,255,255,.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.15)_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Content grid */}
      <div className="relative mx-auto grid h-full max-w-6xl grid-cols-1 md:grid-cols-3 items-center px-6 py-12 gap-8">
        {/* LEFT: Pinned HUD panel */}
        <motion.aside
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="md:sticky md:top-8 self-start"
        >
          <div className="relative rounded-2xl bg-white/6 backdrop-blur-md ring-1 ring-white/15 p-5">
            {/* Corner brackets */}
            <span className="pointer-events-none absolute -top-1 -left-1 h-6 w-6 border-t border-l border-cyan-300/60 rounded-tl-xl" />
            <span className="pointer-events-none absolute -top-1 -right-1 h-6 w-6 border-t border-r border-cyan-300/60 rounded-tr-xl" />
            <span className="pointer-events-none absolute -bottom-1 -left-1 h-6 w-6 border-b border-l border-cyan-300/60 rounded-bl-xl" />
            <span className="pointer-events-none absolute -bottom-1 -right-1 h-6 w-6 border-b border-r border-cyan-300/60 rounded-br-xl" />

            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-[0_1px_0_rgba(0,0,0,0.6)]">
              {title}
            </h1>
            <p className="mt-1 text-sm md:text-base text-white/85 drop-shadow-[0_1px_0_rgba(0,0,0,0.6)]">
              {subtitle}
            </p>



            {howItWorks && (
              <div className="mt-5">
                <h2 className="text-sm font-semibold text-white/90 mb-2">How it works</h2>
                <ol className="space-y-2 text-white/85 text-sm">
                  {howItWorks.map((step, idx) => (
                    <li key={idx} className="rounded-lg bg-white/5 ring-1 ring-white/10 p-3">
                      {idx + 1}. {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </motion.aside>

        {/* CENTER: Glowing blocks stack (you pass as children) */}
        <div className="flex w-full flex-col items-center justify-center">
          {children}
        </div>

        {/* RIGHT: Big CTAs card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="md:justify-self-end w-full max-w-sm"
        >
          <div className="rounded-2xl bg-white/6 backdrop-blur-md ring-1 ring-white/15 p-5 flex flex-col gap-3">
            <button className="w-full rounded-xl px-5 py-3 text-base font-semibold bg-emerald-500 hover:bg-emerald-600 transition shadow-md">
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
            <p className="text-xs text-white/70 mt-1">
              Secure checkout (Stripe). Custom options available.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Bottom-right “Need more info” */}
      {showHint && (
        <motion.button
          onClick={onHintClick}
          className="absolute bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2 text-lg font-semibold text-white/90 bg-white/10 hover:bg-white/15 rounded-lg ring-1 ring-white/20 backdrop-blur transition"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          Need more info <span className="text-2xl leading-none">↓</span>
        </motion.button>
      )}
    </section>
  );
}

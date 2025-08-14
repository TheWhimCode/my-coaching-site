"use client";
import SessionBlock from "@/app/sessions/components/SessionBlock";

type Props = {
  title?: string;
  baseMinutes: number;
  basePriceEUR?: number;   // not used, keep optional
  extraMinutes?: number;
  totalPriceEUR: number;
  isCustomizing?: boolean;
  liveBlocks?: number;     // optional badges
  followups?: number;      // optional badges
};

export default function CenterSessionPanel({
  title = "VOD Review",
  baseMinutes,
  basePriceEUR,
  extraMinutes = 0,
  totalPriceEUR,
  isCustomizing = false,
  liveBlocks = 0,
  followups = 0,
}: Props) {
  const totalMinutes = baseMinutes + extraMinutes;

  return (
    <div className="relative w-full max-w-md">
      <div className="rounded-2xl bg-white/6 backdrop-blur-md ring-1 ring-white/15 p-6">
        <SessionBlock
  title={title}
  minutes={totalMinutes}
  priceEUR={totalPriceEUR}
  liveBlocks={liveBlocks}
  followups={followups}
  isActive={isCustomizing}
  background="transparent"
  className="p-0"
  layoutId="session-block"
/>

{(liveBlocks > 0 || followups > 0) && (
  <div className="mt-3 flex gap-2 text-xs text-white/80">
    {liveBlocks > 0 && (
      <span className="rounded-md bg-white/10 px-2 py-1 ring-1 ring-white/15">
        In-game: {liveBlocks}×45m
      </span>
    )}
    {followups > 0 && (
      <span className="rounded-md bg-white/10 px-2 py-1 ring-1 ring-white/15">
        +{followups}×15m follow-up
      </span>
    )}
  </div>
)}


        {!isCustomizing && (
          <div className="mt-5 text-sm text-white/85 space-y-3">
            <p>Get timestamped insights on your gameplay, a clear action plan, and follow-ups.</p>
            <ul className="space-y-2">
              <li>• Send VOD + goals</li>
              <li>• Live review + notes</li>
              <li>• Action plan & next steps</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

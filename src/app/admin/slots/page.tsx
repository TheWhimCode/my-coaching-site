"use client";
import { useState } from "react";

export default function AdminSlots() {
  const [from, setFrom] = useState(()=>new Date().toISOString().slice(0,10));
  const [to, setTo] = useState(()=>new Date(Date.now()+7*864e5).toISOString().slice(0,10));
  const [log, setLog] = useState<string>("");

  async function call(url: string, body: any) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type":"application/json", "x-admin-key": process.env.NEXT_PUBLIC_ADMIN_UI_KEY || "" },
      body: JSON.stringify(body),
    });
    const j = await res.json();
    setLog(JSON.stringify(j, null, 2));
  }

  const fromISO = `${from}T00:00:00.000Z`;
  const toISO   = `${to}T00:00:00.000Z`;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Admin • Slots</h1>
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span>From (YYYY-MM-DD)</span>
          <input className="px-3 py-2 rounded bg-neutral-900 text-white" value={from} onChange={e=>setFrom(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1">
          <span>To (exclusive)</span>
          <input className="px-3 py-2 rounded bg-neutral-900 text-white" value={to} onChange={e=>setTo(e.target.value)} />
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <button className="px-3 py-2 rounded bg-emerald-600 text-white"
          onClick={()=>call("/api/admin/slots/generate",{ from: fromISO, to: toISO, openHour:13, closeHour:24, stepMin:15 })}>
          Generate 15-min slots
        </button>
        <button className="px-3 py-2 rounded bg-yellow-600 text-white"
          onClick={()=>call("/api/admin/slots/bulk",{ action:"markTaken", from: fromISO, to: toISO })}>
          Mark Taken
        </button>
        <button className="px-3 py-2 rounded bg-sky-600 text-white"
          onClick={()=>call("/api/admin/slots/bulk",{ action:"markFree", from: fromISO, to: toISO })}>
          Mark Free
        </button>
        <button className="px-3 py-2 rounded bg-rose-600 text-white"
          onClick={()=>call("/api/admin/slots/bulk",{ action:"delete", from: fromISO, to: toISO })}>
          Delete
        </button>
        <button
  className="px-3 py-2 rounded bg-orange-600 text-white"
  onClick={() =>
    call("/api/admin/slots/bulk", {
      action: "markTaken",
      from: `${from}T00:00:00.000Z`,
      to: `${from}T23:59:59.999Z`,
    })
  }
>
  Close selected day
</button>

<button
  className="px-3 py-2 rounded bg-orange-700 text-white"
  onClick={() =>
    call("/api/admin/slots/bulk", {
      action: "markTaken",
      from: `${from}T00:00:00.000Z`,
      to: `${to}T00:00:00.000Z`,
    })
  }
>
  Close vacation range
</button>

      </div>

      <pre className="p-3 rounded bg-neutral-900 text-white text-sm overflow-auto">{log || "No actions yet."}</pre>

      <p className="text-xs text-white/60">
        Requests require <code>x-admin-key</code>. For convenience, set <code>NEXT_PUBLIC_ADMIN_UI_KEY</code> in <code>.env.local</code>.
      </p>
    </div>
  );
}

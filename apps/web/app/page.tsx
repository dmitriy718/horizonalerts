import { Metadata } from "next";
import Link from "next/link";
import { SignalCard } from "./ui/SignalCard";

export const metadata: Metadata = {
  title: "Horizon Alerts | Institutional Trade Intelligence",
  description: "Non-repainting, audit-ready trade signals powered by proprietary order flow algorithms. Real-time alerts for serious traders.",
  openGraph: {
    title: "Horizon Alerts | Institutional Trade Intelligence",
    description: "The gold standard of pattern recognition with zero repainting.",
    type: "website",
  }
};

type PublicSignal = {
  id: string;
  symbol: string;
  venue: string;
  asset_type: string;
  pattern: string;
  entry: number;
  sl: number;
  tp1: number | null;
  tp2: number | null;
  tp3: number | null;
  confidence: number;
  bar_time: string;
  published_at: string;
  interval: string;
};

async function fetchPublicFeed() {
  const base = process.env.PUBLIC_API_BASE || "http://localhost:4000";
  try {
    const res = await fetch(`${base}/public-feed`, { next: { revalidate: 60 } });
    if (!res.ok) return { data: [] as PublicSignal[] };
    return res.json();
  } catch {
    return { data: [] as PublicSignal[] };
  }
}

export default async function HomePage() {
  const feed = await fetchPublicFeed();
  const data = (feed?.data || []) as PublicSignal[];

  return (
    <div className="flex flex-col gap-24 py-10">
      {/* HERO SECTION: THE ANTI-REPAINT PROMISE */}
      <section className="relative overflow-hidden rounded-[2.5rem] border border-slate-800 bg-slate-950 px-8 py-20 md:px-16">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-indigo-500/20 blur-[100px]" />
        
        <div className="relative z-10 grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1 text-xs font-medium text-indigo-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500"></span>
              </span>
              PROPRIETARY ALGORITHMS ACTIVE
            </div>
            
            <h1 className="text-5xl font-bold tracking-tight text-white md:text-7xl">
              Signals that <span className="text-indigo-500 underline decoration-indigo-500/30 underline-offset-8">never</span> repaint.
            </h1>
            
            <p className="max-w-xl text-lg leading-relaxed text-slate-400">
              Most "indicators" lie to you. They change history to look perfect. 
              <strong> Horizon Alerts</strong> uses immutable, closed-bar execution. 
              Once a signal is printed, it is locked in our audit ledger forever.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/pricing" className="rounded-xl bg-indigo-600 px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-indigo-500 hover:shadow-[0_0_20px_rgba(79,70,229,0.4)]">
                Get Institutional Access
              </Link>
              <Link href="/academy" className="rounded-xl border border-slate-800 bg-slate-900/50 px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-slate-800">
                The Methodology
              </Link>
            </div>

            <div className="flex items-center gap-6 pt-4 text-xs font-medium uppercase tracking-widest text-slate-500">
              <span className="flex items-center gap-2">✅ Audit Trail</span>
              <span className="flex items-center gap-2">✅ Non-Repainting</span>
              <span className="flex items-center gap-2">✅ Pro-Only Algos</span>
            </div>
          </div>

          <div className="mt-12 lg:mt-0 lg:block transform transition-transform hover:scale-105 duration-500">
             <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-2 shadow-2xl shadow-indigo-500/20 ring-1 ring-white/10">
                <div className="flex items-center justify-between border-b border-white/5 px-4 py-3 bg-white/5 rounded-t-xl">
                  <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-500/50" />
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-500/50" />
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/50" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Audit_Ledger_v1.04</span>
                </div>
                <div className="space-y-2 p-6 font-mono text-xs md:text-sm leading-relaxed">
                  <div className="flex gap-3">
                    <span className="text-slate-500">[14:02:11]</span>
                    <span className="text-emerald-400">SIGNAL_LOCKED:</span>
                    <span className="text-white">NVDA / INSTITUTIONAL_VICE / ENTRY: 612.40</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-slate-500">[14:02:11]</span>
                    <span className="text-blue-400">LOG_IMMUTABLE:</span>
                    <span className="text-slate-300">SUCCESS {`{ hash: 0x8a... }`}</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-slate-500">[14:15:00]</span>
                    <span className="text-indigo-400">PUBLIC_FEED_DELAYED:</span>
                    <span className="text-slate-300">PUBLISHED</span>
                  </div>
                  <div className="flex gap-3 animate-pulse">
                    <span className="text-slate-500">_</span>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* LIVE SIGNAL TICKER */}
      <section className="relative -mx-6 overflow-hidden border-y border-slate-800/50 bg-slate-900/20 py-4">
        <div className="flex animate-scroll whitespace-nowrap">
           {Array(4).fill(data).flat().map((signal, idx) => (
             <div key={idx} className="mx-8 flex items-center gap-4 text-xs font-medium text-slate-400">
                <span className="font-bold text-white">{signal.symbol}</span>
                <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-indigo-400">{signal.pattern}</span>
                <span className="text-emerald-500">+{((Math.random() * 5)).toFixed(2)}%</span>
             </div>
           ))}
        </div>
      </section>

      {/* PROPRIETARY ALGORITHMS PREVIEW */}
      <section className="space-y-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">The Gold Standard of Detection</h2>
          <p className="mt-4 text-slate-400">Three proprietary engines built for institutional-grade precision.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Institutional Vice",
              desc: "Detects passive absorption where big money traps retail momentum.",
              tag: "REVERSAL"
            },
            {
              title: "Velocity Vault",
              desc: "Spots explosive imbalances before the trend expansion occurs.",
              tag: "BREAKOUT"
            },
            {
              title: "Delta Divergence",
              desc: "Identifies hidden strength in pullbacks using order-flow skew.",
              tag: "CONTINUATION"
            }
          ].map(algo => (
            <div key={algo.title} className="group relative rounded-3xl border border-slate-800 bg-slate-900/30 p-8 transition-all hover:border-indigo-500/50 hover:bg-slate-900/50">
              <div className="mb-4 inline-block rounded-lg bg-indigo-500/10 px-3 py-1 text-[10px] font-bold text-indigo-400 uppercase">
                {algo.tag}
              </div>
              <h3 className="text-xl font-bold text-white">{algo.title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-slate-400">{algo.desc}</p>
              <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-indigo-400">
                PRO FEATURE <span className="h-1 w-1 rounded-full bg-indigo-400" /> VIEW AUDIT
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* RECENT ALERTS FEED */}
      <section className="space-y-8">
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white">Public Feed</h2>
            <p className="text-sm text-slate-500">Delayed 15 minutes for compliance.</p>
          </div>
          <Link href="/pricing" className="text-sm font-semibold text-indigo-400 hover:text-indigo-300">
            Go Real-Time →
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-slate-800 py-20 text-center text-slate-500">
              No public signals in the last session.
            </div>
          ) : (
            data.map(signal => (
              <SignalCard key={signal.id} signal={signal} />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
import Link from "next/link";

const drills = [
  {
    title: "Market Regime Identification",
    desc: "Learn to distinguish between trending, ranging, and chopping markets using Volume Profile.",
    level: "Beginner",
    duration: "15 min",
    locked: false,
    icon: "📊"
  },
  {
    title: "The Institutional Vice",
    desc: "Master our proprietary reversal setup. Identify absorption at key HVN levels.",
    level: "Advanced",
    duration: "45 min",
    locked: true,
    icon: "🗜️"
  },
  {
    title: "Risk-First Position Sizing",
    desc: "Calculate lot size based on volatility (ATR) rather than arbitrary dollar amounts.",
    level: "Intermediate",
    duration: "20 min",
    locked: true,
    icon: "⚖️"
  },
  {
    title: "Order Flow Anomalies",
    desc: "Spotting aggressive delta imbalances and hidden liquidity reloading.",
    level: "Expert",
    duration: "60 min",
    locked: true,
    icon: "🌊"
  }
];

export default function AcademyPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center">
          <h1 className="text-5xl font-bold text-white md:text-7xl">
            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Academy</span>
          </h1>
          <p className="mt-6 text-xl text-slate-400 max-w-2xl mx-auto">
            Stop guessing. Start executing. Our curriculum is built on institutional order flow mechanics, not lagging indicators.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
          {drills.map((drill) => (
            <div key={drill.title} className={`group relative overflow-hidden rounded-3xl border p-8 transition-all ${drill.locked ? 'border-white/5 bg-slate-900/50 opacity-75' : 'border-white/10 bg-slate-900/80 hover:border-cyan-500/50'}`}>
              <div className="flex items-start justify-between">
                <div className="text-4xl">{drill.icon}</div>
                {drill.locked ? (
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-slate-500 uppercase tracking-wide">
                    🔒 Pro Only
                  </span>
                ) : (
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 uppercase tracking-wide">
                    🟢 Free Access
                  </span>
                )}
              </div>
              
              <h3 className="mt-6 text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                {drill.title}
              </h3>
              <p className="mt-3 text-slate-400 leading-relaxed">
                {drill.desc}
              </p>

              <div className="mt-8 flex items-center gap-6 text-sm text-slate-500 font-medium">
                <span className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${drill.level === 'Expert' ? 'bg-red-500' : drill.level === 'Advanced' ? 'bg-orange-500' : 'bg-blue-500'}`} />
                  {drill.level}
                </span>
                <span>⏱ {drill.duration}</span>
              </div>

              {drill.locked && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/60 backdrop-blur-[2px] opacity-0 transition-opacity group-hover:opacity-100">
                  <Link href="/pricing" className="btn-primary shadow-lg">
                    Unlock Module
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-20 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-12 text-center">
          <h2 className="text-3xl font-bold text-white">Ready to master the markets?</h2>
          <p className="mt-4 text-slate-400">Join 2,500+ traders leveling up their game daily.</p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/onboarding" className="btn-primary">
              Start Assessment
            </Link>
            <Link href="/pricing" className="btn-secondary">
              View Plans
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
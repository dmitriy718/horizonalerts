import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-20 pb-20">
      <div className="mx-auto max-w-4xl px-6">
        
        {/* Mission Header */}
        <section className="text-center mb-24">
          <h1 className="text-5xl font-bold text-white md:text-7xl">
            We track the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Whales.</span>
          </h1>
          <p className="mt-8 text-xl leading-relaxed text-slate-300">
            The market is not random. It is an auction. Horizon Services was built to decode that auction, stripping away the noise of retail indicators to reveal where the real money is moving.
          </p>
        </section>

        {/* The Problem / Solution */}
        <div className="grid gap-12 md:grid-cols-2 mb-24">
          <div className="glass-card rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-red-500/10 blur-3xl rounded-full" />
            <h3 className="text-2xl font-bold text-white mb-4">The Retail Trap</h3>
            <p className="text-slate-400">
              Most traders lose because they look at the past. Moving averages, RSI, Bollinger Bands—they all tell you what <em>has</em> happened. By the time the signal flashes, the institutions are already exiting.
            </p>
          </div>
          <div className="glass-card rounded-3xl p-8 relative overflow-hidden">
             <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-green-500/10 blur-3xl rounded-full" />
            <h3 className="text-2xl font-bold text-white mb-4">The Horizon Edge</h3>
            <p className="text-slate-400">
              We look at the present. Our engines process Volume Profile and Order Flow in real-time, detecting the hidden absorption and aggression of institutional players <em>before</em> price moves.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-24">
          {[
            { label: "Signals Processed", val: "1.2M+" },
            { label: "Uptime", val: "99.99%" },
            { label: "Data Latency", val: "<50ms" },
            { label: "Repaints", val: "0" },
          ].map(stat => (
            <div key={stat.label} className="text-center p-6 rounded-2xl bg-white/5 border border-white/5">
              <div className="text-2xl md:text-3xl font-bold text-white">{stat.val}</div>
              <div className="text-xs uppercase tracking-widest text-slate-500 mt-2">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Founder Note */}
        <section className="glass-card rounded-3xl p-10 md:p-14 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">From the Founder</h2>
          <blockquote className="text-lg text-slate-300 italic mb-8">
            "I built Horizon because I was tired of 'black box' signals that mysteriously vanished from the chart when they failed. I wanted a system that was auditable, transparent, and rigorous. If we take a loss, we own it. If we win, we earned it."
          </blockquote>
          <div className="flex items-center justify-center gap-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-slate-700 to-slate-600" />
            <div className="text-left">
              <div className="text-white font-bold">Dmitriy</div>
              <div className="text-cyan-400 text-xs uppercase tracking-wide">Lead Architect</div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
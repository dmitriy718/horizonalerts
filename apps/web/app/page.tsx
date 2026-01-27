export const dynamic = "force-dynamic";

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
  const res = await fetch(`${base}/public-feed`, { next: { revalidate: 60 } });
  if (!res.ok) {
    return { data: [] as PublicSignal[] };
  }
  return res.json();
}

export default async function HomePage() {
  const feed = await fetchPublicFeed();
  const data = (feed?.data || []) as PublicSignal[];

  return (
    <div className="space-y-20">
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/60 p-12">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute -top-32 right-0 h-72 w-72 rounded-full bg-horizon-500/30 blur-3xl" />
        <div className="absolute -bottom-24 left-0 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="relative">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Members-only signal intelligence
          </p>
          <h1 className="mt-4 text-5xl font-semibold text-white md:text-6xl">
            Horizon Services Trade Alerts
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-300">
            Personalized alerts for Day, Swing, and Investor styles with immutable,
            closed-bar signals, full provenance, and compliance-first delivery.
            No repainting. No execution.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              className="glow rounded-md bg-horizon-500 px-6 py-3 text-sm font-semibold text-white"
              href="/pricing"
            >
              Start membership
            </a>
            <a
              className="rounded-md border border-slate-700 px-6 py-3 text-sm text-slate-200"
              href="/academy"
            >
              Learn the methodology
            </a>
            <a
              className="rounded-md border border-slate-800 px-6 py-3 text-sm text-slate-300"
              href="/onboarding"
            >
              Take the onboarding
            </a>
          </div>
          <div className="mt-6 text-xs text-slate-400">
            Public feed is delayed by 15 minutes for compliance. Members receive
            real-time alerts.
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              { label: "p95 read latency", value: "<300ms (cache)" },
              { label: "alert fanout", value: "<2s" },
              { label: "uptime target", value: "99.9%" }
            ].map((stat) => (
              <div key={stat.label} className="glass rounded-xl p-4">
                <div className="text-sm text-slate-400">{stat.label}</div>
                <div className="mt-2 text-lg font-semibold text-white">
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 ticker border-y border-slate-800/60 py-3 text-xs text-slate-400">
            <div className="ticker-track">
              {[
                "AAPL 190.42 +0.8%",
                "NVDA 703.16 +1.2%",
                "TSLA 233.41 -0.4%",
                "MSFT 411.21 +0.6%",
                "BTC 41,900 +1.1%",
                "ETH 2,320 +0.7%",
                "SPY 488.20 +0.3%",
                "QQQ 416.34 +0.5%"
              ]
                .concat([
                  "AAPL 190.42 +0.8%",
                  "NVDA 703.16 +1.2%",
                  "TSLA 233.41 -0.4%",
                  "MSFT 411.21 +0.6%",
                  "BTC 41,900 +1.1%",
                  "ETH 2,320 +0.7%",
                  "SPY 488.20 +0.3%",
                  "QQQ 416.34 +0.5%"
                ])
                .map((item) => (
                  <span key={item}>{item}</span>
                ))}
            </div>
          </div>
        </div>
      </section>

      <section className="glass rounded-2xl p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Trusted by serious traders
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              Institutions and professionals demand transparency.
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Full audit trails, compliance-first copy, and zero repainting.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {["Methodology", "Latency", "Audit", "Compliance", "Security"].map(
              (item) => (
                <span
                  key={item}
                  className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300"
                >
                  {item}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: "Live alerts, zero repaint",
            body: "Closed-bar computation with immutable records. Any revision is a new row."
          },
          {
            title: "Personalized to your style",
            body: "Onboarding maps you to Day, Swing, or Investor with risk‑aware exits."
          },
          {
            title: "Options mode ready",
            body: "Filter by DTE, OI, and moneyness for single‑leg contract ideas."
          }
        ].map((feature) => (
          <div key={feature.title} className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
            <p className="mt-3 text-sm text-slate-300">{feature.body}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: "Non-repainting engine",
            body: "Signals are computed on closed bars and written immutably. Revisions are new rows."
          },
          {
            title: "Signal provenance",
            body: "Each alert shows detectors, latency, and methodology behind the confidence score."
          },
          {
            title: "Risk-aware exits",
            body: "Static + trailing SL with TP1–TP3 tiers tuned to your risk band."
          }
        ].map((feature) => (
          <div key={feature.title} className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
            <p className="mt-3 text-sm text-slate-300">{feature.body}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white">Signal delivery</h3>
          <p className="mt-3 text-sm text-slate-300">
            Push + email alerts with dedupe, consensus verification, and latency metadata.
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-300">
            {["Real‑time member feed", "Audit ledger", "Confidence scoring", "Provenance cards"].map(
              (item) => (
                <span
                  key={item}
                  className="rounded-full border border-slate-700 px-3 py-1"
                >
                  {item}
                </span>
              )
            )}
          </div>
        </div>
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white">Risk controls</h3>
          <p className="mt-3 text-sm text-slate-300">
            SL/TP tiers, optional trailing stops, and playbook modes for wealth,
            income, or preservation.
          </p>
          <div className="mt-4 flex gap-3">
            <a
              className="rounded-md border border-slate-700 px-4 py-2 text-xs text-slate-200"
              href="/academy"
            >
              Explore playbooks
            </a>
            <a
              className="rounded-md border border-slate-700 px-4 py-2 text-xs text-slate-200"
              href="/pricing"
            >
              Compare plans
            </a>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Latest alerts</h2>
          <span className="text-xs text-slate-500">15‑minute public delay</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {data.length === 0 && (
            <div className="glass rounded-xl p-6 text-sm text-slate-400">
              No alerts published yet. Check back during market hours.
            </div>
          )}
          {data.map((alert) => (
            <div key={alert.id} className="glass rounded-xl p-6">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span className="text-base font-semibold text-white">
                  {alert.symbol}
                </span>
                <span className="rounded-full border border-slate-700 px-3 py-1 text-xs">
                  {alert.pattern}
                </span>
              </div>
              <div className="mt-3 text-xs text-slate-400">
                {alert.venue} · {alert.asset_type} · {alert.interval}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-300">
                <div>Entry: {Number(alert.entry).toFixed(2)}</div>
                <div>SL: {Number(alert.sl).toFixed(2)}</div>
                <div>TP1: {alert.tp1 ? Number(alert.tp1).toFixed(2) : "-"}</div>
                <div>TP2: {alert.tp2 ? Number(alert.tp2).toFixed(2) : "-"}</div>
              </div>
              <div className="mt-3 text-xs text-slate-400">
                Confidence {alert.confidence}/100
              </div>
              <div className="mt-2 text-xs text-slate-500">
                Published {new Date(alert.published_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white">Why traders switch</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            <li>• Consensus + dedupe for cleaner live alerts</li>
            <li>• Transparent methodology and latency disclosure</li>
            <li>• Clear, auditable records for every signal</li>
            <li>• Personalized filters by style and risk</li>
          </ul>
        </div>
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white">Built for compliance</h3>
          <p className="mt-4 text-sm text-slate-300">
            No execution pathways. No fixed win-rate claims. All alerts are
            informational and time-stamped with immutable records and audit trails.
          </p>
          <div className="mt-6 flex gap-3">
            <a
              className="rounded-md border border-slate-700 px-4 py-2 text-xs text-slate-200"
              href="/trust-safety"
            >
              Trust & Safety
            </a>
            <a
              className="rounded-md border border-slate-700 px-4 py-2 text-xs text-slate-200"
              href="/pricing"
            >
              View plans
            </a>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {[
          {
            quote:
              "The no‑repaint policy and audit trail make this the only signal feed we trust.",
            name: "Lead Analyst",
            firm: "Quant Desk"
          },
          {
            quote:
              "Fast fanout and clear confidence scoring keep our traders focused.",
            name: "Portfolio Manager",
            firm: "Momentum Fund"
          },
          {
            quote:
              "The onboarding + risk tiers are perfect for dialing in playbooks.",
            name: "Head of Trading",
            firm: "Alpha Group"
          }
        ].map((item) => (
          <div key={item.name} className="glass rounded-2xl p-6">
            <p className="text-sm text-slate-200">“{item.quote}”</p>
            <div className="mt-4 text-xs text-slate-400">
              {item.name} · {item.firm}
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {[
          { label: "Coverage", value: "US + Canada + BTC/ETH" },
          { label: "Scanner presets", value: "7+ patterns" },
          { label: "Alert caps", value: "Free 5/day · Pro unlimited" }
        ].map((item) => (
          <div key={item.label} className="glass rounded-2xl p-6 text-center">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
              {item.label}
            </div>
            <div className="mt-3 text-lg font-semibold text-white">{item.value}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="glass rounded-2xl p-8">
          <h3 className="text-2xl font-semibold text-white">Ready to go pro?</h3>
          <p className="mt-3 text-sm text-slate-300">
            Get unlimited alerts, advanced filters, and personalized playbooks.
          </p>
          <div className="mt-6 flex gap-4">
            <a
              className="rounded-md bg-horizon-500 px-6 py-3 text-sm font-semibold text-white"
              href="/pricing"
            >
              Start membership
            </a>
            <a
              className="rounded-md border border-slate-700 px-6 py-3 text-sm text-slate-200"
              href="/onboarding"
            >
              Take onboarding
            </a>
          </div>
        </div>
        <div className="glass rounded-2xl p-8">
          <h3 className="text-2xl font-semibold text-white">Need a walkthrough?</h3>
          <p className="mt-3 text-sm text-slate-300">
            Reach our team for demos, enterprise setups, or licensing questions.
          </p>
          <div className="mt-6 flex gap-4">
            <a
              className="rounded-md border border-slate-700 px-6 py-3 text-sm text-slate-200"
              href="/contact"
            >
              Contact us
            </a>
            <a
              className="rounded-md border border-slate-700 px-6 py-3 text-sm text-slate-200"
              href="mailto:support@horizonsvc.com"
            >
              Email support
            </a>
          </div>
        </div>
      </section>

      <section className="glass rounded-2xl p-8 text-center">
        <h3 className="text-2xl font-semibold text-white">
          Ready for faster, cleaner alerts?
        </h3>
        <p className="mt-3 text-sm text-slate-300">
          Join Horizon Services and personalize your signal flow in minutes.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <a
            className="rounded-md bg-horizon-500 px-6 py-3 text-sm font-semibold text-white"
            href="/pricing"
          >
            Start membership
          </a>
          <a
            className="rounded-md border border-slate-700 px-6 py-3 text-sm text-slate-200"
            href="/login"
          >
            Sign in
          </a>
        </div>
        <div className="mt-6 text-xs text-slate-400">
          Questions? <a className="underline" href="/contact">Contact us</a> or email{" "}
          <a className="underline" href="mailto:support@horizonsvc.com">
            support@horizonsvc.com
          </a>
        </div>
      </section>
    </div>
  );
}

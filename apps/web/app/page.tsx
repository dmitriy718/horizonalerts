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
    <div className="space-y-12">
      <section className="glass rounded-2xl p-10">
        <p className="text-sm uppercase tracking-wide text-slate-400">
          Members-only signal intelligence
        </p>
        <h1 className="mt-4 text-4xl font-semibold text-white">
          Horizon Services Trade Alerts
        </h1>
        <p className="mt-4 max-w-2xl text-slate-300">
          Personalized trade alerts for Day, Swing, and Investor styles. Signals
          are computed on closed bars, deduped, and published with full
          provenance. No repainting. No execution.
        </p>
        <div className="mt-6 flex gap-4">
          <a
            className="rounded-md bg-horizon-500 px-5 py-2 text-sm font-semibold text-white"
            href="/pricing"
          >
            Start membership
          </a>
          <a
            className="rounded-md border border-slate-700 px-5 py-2 text-sm text-slate-200"
            href="/academy"
          >
            Learn the methodology
          </a>
        </div>
        <div className="mt-6 text-xs text-slate-400">
          Public feed is delayed by 15 minutes for compliance.
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Latest alerts</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {data.length === 0 && (
            <div className="glass rounded-xl p-6 text-sm text-slate-400">
              No alerts published yet. Check back during market hours.
            </div>
          )}
          {data.map((alert) => (
            <div key={alert.id} className="glass rounded-xl p-6">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>{alert.symbol}</span>
                <span>{alert.pattern}</span>
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
    </div>
  );
}

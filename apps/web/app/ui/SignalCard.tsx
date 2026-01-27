type Signal = {
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

export function SignalCard({ signal }: { signal: Signal }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 p-6 transition-all hover:border-slate-700 hover:bg-slate-900/60">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-lg font-bold text-white">{signal.symbol}</span>
          <span className="ml-2 text-[10px] text-slate-500">{signal.interval}</span>
        </div>
        <div className="rounded-full bg-slate-800 px-2.5 py-1 text-[10px] font-bold text-slate-300">
          {signal.pattern.replace("_", " ")}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-wider text-slate-500">Entry</div>
          <div className="text-sm font-mono text-white">${Number(signal.entry).toFixed(2)}</div>
        </div>
        <div className="space-y-1 text-right">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 text-rose-500/70">Stop Loss</div>
          <div className="text-sm font-mono text-rose-400">${Number(signal.sl).toFixed(2)}</div>
        </div>
      </div>

      <div className="mt-4 border-t border-slate-800 pt-4">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-slate-500">
           Targets
           <span className="text-emerald-500">Confidence {signal.confidence}%</span>
        </div>
        <div className="mt-2 flex gap-2">
           {[signal.tp1, signal.tp2, signal.tp3].map((tp, i) => (
             tp && (
               <div key={i} className="flex-1 rounded-md bg-slate-800/50 p-2 text-center text-[10px] font-mono text-emerald-400">
                 T{i+1}: ${Number(tp).toFixed(2)}
               </div>
             )
           ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between text-[10px] text-slate-500">
        <span>Published {new Date(signal.published_at).toLocaleTimeString()}</span>
        <span className="italic">Closed-Bar Locked</span>
      </div>
    </div>
  );
}

export default function TrustSafetyPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-white">Trust & Safety</h1>
      <p className="text-slate-300">
        Horizon Services provides educational alerts only. We do not execute
        trades or offer investment advice. Signals are computed on closed bars,
        recorded immutably, and published with clear timestamps.
      </p>
      <div className="glass rounded-xl p-6 text-sm text-slate-300">
        Methodology highlights:
        <ul className="mt-3 space-y-2">
          <li>• Non-repainting signal engine</li>
          <li>• Confidence based on pattern quality and liquidity</li>
          <li>• Transparent audit ledger</li>
          <li>• 15-minute delayed public feed</li>
        </ul>
      </div>
    </div>
  );
}

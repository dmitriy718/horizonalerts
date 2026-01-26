const drills = [
  "Identify trend vs range regimes",
  "Practice risk sizing with ATR bands",
  "Spot RSI divergence with confirmation",
  "Review gap fill entries and exits"
];

export default function AcademyPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-white">Academy</h1>
      <p className="text-slate-300">
        Interactive drills and playbooks tailored to your trading style.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {drills.map((drill) => (
          <div key={drill} className="glass rounded-xl p-6 text-sm text-slate-300">
            {drill}
          </div>
        ))}
      </div>
    </div>
  );
}

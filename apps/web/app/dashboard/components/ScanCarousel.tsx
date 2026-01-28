"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Activity, Users, BarChart2, CheckCircle } from "lucide-react";

interface ScanCarouselProps {
  candidates: string[];
  activeFilters: string[];
  onMatchFound: (ticker: string) => void;
}

export function ScanCarousel({ candidates, activeFilters, onMatchFound }: ScanCarouselProps) {
  const [activeScan, setActiveScan] = useState<string | null>(null);
  const [scanStep, setScanStep] = useState(0);

  useEffect(() => {
    if (candidates.length === 0) return;

    let lastTicker = "";

    const interval = setInterval(() => {
      // Pick a random ticker (avoid immediate repeat)
      let randomTicker = candidates[Math.floor(Math.random() * candidates.length)];
      while (randomTicker === lastTicker && candidates.length > 1) {
        randomTicker = candidates[Math.floor(Math.random() * candidates.length)];
      }
      lastTicker = randomTicker;

      setActiveScan(randomTicker);
      setScanStep(0);

      // Simulate scan steps (Social -> Volume -> Pattern -> Match/NoMatch)
      let step = 0;
      const stepInterval = setInterval(() => {
        step++;
        setScanStep(step);
        if (step >= 4) {
          clearInterval(stepInterval);
          // Match chance (boosted if filters are active to simulate "finding" what you want)
          if (Math.random() > 0.7) {
            onMatchFound(randomTicker);
          }
          setActiveScan(null);
        }
      }, 150); // Speed: 150ms per step

    }, 1200); // Speed: New scan every 1.2s

    return () => clearInterval(interval);
  }, [candidates, onMatchFound, activeFilters]); // Re-run if filters change (optional, but good for resetting rhythm)

  return (
    <div className="relative mb-8 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400 shrink-0">
          <div className="absolute inset-0 animate-ping rounded-full bg-cyan-500/20 duration-700" />
          <Search size={28} className={activeScan ? "animate-pulse" : ""} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white truncate">
              {activeScan ? `Scanning ${activeScan}...` : "Market Surveillance Active"}
            </h3>
            <span className="text-xs font-mono text-cyan-400 shrink-0">
              {activeScan ? "ANALYZING" : "IDLE"}
            </span>
          </div>

          <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-800">
            {activeScan && (
              <motion.div
                className="absolute inset-0 bg-cyan-500"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.6, ease: "linear" }}
              />
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {/* Show metrics OR active filters */}
            {activeFilters.length > 0 ? (
               activeFilters.map(f => (
                 <span key={f} className="inline-flex items-center gap-1 rounded-md bg-indigo-500/20 px-2 py-1 text-[10px] font-medium text-indigo-300 border border-indigo-500/30">
                   <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                   {f}
                 </span>
               ))
            ) : (
              <>
                <ScanMetric label="Social" icon={Users} active={scanStep >= 1} />
                <ScanMetric label="Vol" icon={BarChart2} active={scanStep >= 2} />
                <ScanMetric label="Price" icon={Activity} active={scanStep >= 3} />
                <ScanMetric label="Pattern" icon={CheckCircle} active={scanStep >= 4} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Background Decor */}
      <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-cyan-500/5 blur-3xl" />
    </div>
  );
}

function ScanMetric({ label, icon: Icon, active }: { label: string; icon: any; active: boolean }) {
  return (
    <div className={`flex items-center gap-2 text-xs transition-colors duration-300 ${active ? "text-white" : "text-slate-600"}`}>
      <div className={`rounded-full p-1 ${active ? "bg-emerald-500 text-white" : "bg-slate-800"}`}>
        <Icon size={12} />
      </div>
      {label}
    </div>
  );
}

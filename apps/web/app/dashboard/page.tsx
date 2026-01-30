"use client";
import { useState, useEffect } from "react";
import { Search, Filter, TrendingUp, Zap, Plus, X, Lock, Settings, LayoutDashboard, List, Trophy, Eye, Maximize2 } from "lucide-react";
import { useAuth } from "../context/auth-context";
import { getApiBaseUrl } from "../lib/api";
import { ScanCarousel } from "./components/ScanCarousel";
import { getSmartReason } from "./utils/reasons";
import { TradingChart } from "../components/TradingChart";
import { MiniChart } from "../components/MiniChart";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("scanner");
  const [signals, setSignals] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<string[]>([]);
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  
  // Scanner State
  const [activeFilters, setActiveFilters] = useState<string[]>(["High Volatility"]);
  const [customFilter, setCustomFilter] = useState("");

  const PRESETS = ["Vol > 1M", "RSI < 30", "Gap Up", "Social Hype", "Inst. Buys"];
  const PREMIUM_ALGOS = ["Institutional Vice", "Velocity Vault", "Delta Divergence"];

  const toggleFilter = (f: string) => {
    setActiveFilters(prev => 
      prev.includes(f) ? prev.filter(i => i !== f) : [...prev, f]
    );
  };

  const addCustomFilter = (e: React.FormEvent) => {
    e.preventDefault();
    if (customFilter && !activeFilters.includes(customFilter)) {
      setActiveFilters([...activeFilters, customFilter]);
      setCustomFilter("");
    }
  };

  useEffect(() => {
    fetch(`${getApiBaseUrl()}/public-feed/candidates`)
      .then(res => res.json())
      .then(data => {
        setCandidates([...(data.day || []), ...(data.swing || [])]);
      })
      .catch(() => setCandidates(["AAPL", "TSLA", "NVDA", "AMD", "MSFT"]));

    if (!user) return;
    
    const fetchSignals = async () => {
      try {
        const token = await user.getIdToken();
        const res = await fetch(`${getApiBaseUrl()}/scanner`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const json = await res.json();
          setSignals(json.data || []);
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchSignals();
    const interval = setInterval(fetchSignals, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const handleMatch = (ticker: string) => {
    console.log(`Scanner highlighted: ${ticker}`);
  };

  const tabs = [
    { id: "scanner", label: "Scanner", icon: LayoutDashboard },
    { id: "positions", label: "My Positions", icon: List },
    { id: "config", label: "Configuration", icon: Settings },
    { id: "winners", label: "Top Winners", icon: Trophy },
    { id: "watchlist", label: "Watchlist", icon: Eye },
  ];

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-20 relative">
      <div className="mx-auto max-w-7xl px-6">
        
        {/* CHART MODAL OVERLAY */}
        <AnimatePresence>
          {selectedTicker && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-10"
              onClick={() => setSelectedTicker(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative w-full h-full md:max-w-5xl md:h-[80vh] bg-slate-950 rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-4 bg-slate-900/50 backdrop-blur-md border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold text-white">{selectedTicker}</span>
                    <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded">5m / Heikin Ashi / Live</span>
                  </div>
                  <button 
                    onClick={() => setSelectedTicker(null)}
                    className="p-2 rounded-full bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="pt-16 w-full h-full">
                  <TradingChart symbol={selectedTicker} />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Live Dashboard</h1>
            <p className="text-sm text-slate-400">Welcome back, Trader. Market is <span className="text-emerald-400">Open</span>.</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 rounded-xl bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all">
              <Zap size={16} /> Alerts ({signals.length})
            </button>
          </div>
        </div>

        <div className="mb-8 flex items-center gap-2 overflow-x-auto border-b border-white/5 pb-1 no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-t-lg border-b-2 px-6 py-3 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "border-cyan-500 bg-white/5 text-white"
                  : "border-transparent text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="min-h-[400px]">
          
          {activeTab === "scanner" && (
            <>
              <div className="mb-6 flex flex-wrap gap-2">
                {activeFilters.length > 0 ? (
                  activeFilters.map(f => (
                    <span key={f} className="inline-flex items-center gap-1 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-medium text-indigo-300 border border-indigo-500/30">
                      {f}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">No active filters. Configure in 'Configuration' tab.</span>
                )}
              </div>

              <ScanCarousel candidates={candidates} activeFilters={activeFilters} onMatchFound={handleMatch} />

              <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Signal Feed</h2>
                    <button className="text-xs font-medium text-slate-400 hover:text-white flex items-center gap-1">
                      <Filter size={14} /> Filter
                    </button>
                  </div>

                  {signals.length === 0 && (
                    <div className="text-center py-10 text-slate-500">Waiting for signals...</div>
                  )}

                  {signals.map((signal) => (
                    <div 
                      key={signal.id} 
                      onClick={() => setSelectedTicker(signal.symbol)}
                      className="glass-card rounded-2xl p-6 border-l-4 border-l-cyan-500 hover:bg-slate-900/80 transition-all cursor-pointer group relative overflow-hidden"
                    >
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <Maximize2 size={16} className="text-slate-400" />
                      </div>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="text-xl font-bold text-white">{signal.symbol}</span>
                            <span className="rounded bg-cyan-500/20 px-2 py-0.5 text-xs font-bold text-cyan-400">{signal.pattern}</span>
                            <span className="text-xs text-slate-500">{new Date(signal.bar_time).toLocaleTimeString()}</span>
                          </div>
                          <div className="mt-2 text-sm text-slate-300">
                            {JSON.stringify(signal.features).replace(/^{"logic":"|"}$/g, "")}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-mono font-bold text-emerald-400">
                            {isNaN(Number(signal.entry)) ? signal.entry : Number(signal.entry).toFixed(2)}
                          </div>
                          <div className="text-xs text-slate-500">Entry Zone</div>
                        </div>
                      </div>

                      {/* Mini Chart Preview */}
                      <div className="h-24 w-full mb-4 rounded-lg overflow-hidden border border-white/5 bg-slate-900/50 pointer-events-none">
                        <MiniChart symbol={signal.symbol} />
                      </div>

                      <div className="flex gap-4 border-t border-white/5 pt-4 text-xs font-mono text-slate-400 group-hover:text-slate-300">
                        <span>TP1: {Number(signal.tp1).toFixed(2)}</span>
                        <span>TP2: {Number(signal.tp2).toFixed(2)}</span>
                        <span className="text-red-400/80">SL: {Number(signal.sl).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-6">
                  <div className="glass-card rounded-2xl p-6">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                      <TrendingUp size={18} className="text-emerald-400" /> Market Pulse
                    </h3>
                    <div className="space-y-3">
                      {["SPY Bullish > 505", "VIX Crushing < 13", "BTC Reclaiming 68k"].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* CONFIGURATION TAB */}
          {activeTab === "config" && (
            <div className="max-w-2xl mx-auto space-y-12">
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-white">Scanner Parameters</h2>
                <div className="flex flex-wrap gap-3">
                  {PRESETS.map(p => (
                    <button
                      key={p}
                      onClick={() => toggleFilter(p)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition-all border ${
                        activeFilters.includes(p) 
                          ? "bg-cyan-500 text-black border-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.4)]" 
                          : "bg-slate-900 text-slate-400 border-white/10 hover:border-white/30 hover:text-white"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <form onSubmit={addCustomFilter} className="flex gap-4">
                  <input 
                    type="text" 
                    placeholder="Add custom parameter (e.g. 'Golden Cross')" 
                    className="flex-1 rounded-xl bg-slate-900 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-all"
                    value={customFilter}
                    onChange={e => setCustomFilter(e.target.value)}
                  />
                  <button type="submit" className="rounded-xl bg-white/10 px-6 py-3 text-sm font-bold text-white hover:bg-white/20 transition-all">
                    Add
                  </button>
                </form>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    Proprietary Algorithms <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded uppercase font-bold">Premium</span>
                  </h2>
                </div>
                <div className="grid gap-4">
                  {PREMIUM_ALGOS.map(algo => (
                    <button
                      key={algo}
                      onClick={() => toggleFilter(algo)}
                      className={`group relative flex items-center justify-between rounded-xl border p-6 text-left transition-all ${
                        activeFilters.includes(algo)
                          ? "bg-indigo-600/20 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)]"
                          : "bg-slate-900 border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div>
                        <h3 className={`font-bold ${activeFilters.includes(algo) ? "text-indigo-300" : "text-white"}`}>
                          {algo}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">Institutional-grade pattern recognition engine.</p>
                      </div>
                      <div className={`h-6 w-6 rounded-full border flex items-center justify-center ${
                        activeFilters.includes(algo) ? "border-indigo-500 bg-indigo-500 text-white" : "border-slate-700 bg-slate-800"
                      }`}>
                        {activeFilters.includes(algo) && <Filter size={12} />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PLACEHOLDERS */}
          {activeTab === "positions" && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <List size={48} className="mb-4 opacity-20" />
              <p>No active positions connected.</p>
              <button className="mt-4 text-cyan-400 hover:underline">Connect Brokerage</button>
            </div>
          )}
          {activeTab === "winners" && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <Trophy size={48} className="mb-4 opacity-20" />
              <p>Top Winners leaderboard updates at market close.</p>
            </div>
          )}
          {activeTab === "watchlist" && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <Eye size={48} className="mb-4 opacity-20" />
              <p>Your watchlist is empty.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
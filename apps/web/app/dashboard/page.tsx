"use client";
import { useState } from "react";
import { Bell, Search, Filter, TrendingUp, Zap } from "lucide-react";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("feed");

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-20">
      <div className="mx-auto max-w-7xl px-6">
        
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Live Dashboard</h1>
            <p className="text-sm text-slate-400">Welcome back, Trader. Market is <span className="text-emerald-400">Open</span>.</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all">
              <Search size={16} /> Scan
            </button>
            <button className="flex items-center gap-2 rounded-xl bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all">
              <Zap size={16} /> Alerts (2)
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          {[
            { label: "Daily P&L", val: "+$420.50", color: "text-emerald-400" },
            { label: "Win Rate", val: "68%", color: "text-blue-400" },
            { label: "Active Trades", val: "3", color: "text-white" },
            { label: "Risk Exposure", val: "1.2%", color: "text-orange-400" },
          ].map((stat, i) => (
            <div key={i} className="glass-card rounded-xl p-4">
              <div className="text-xs font-bold uppercase text-slate-500 tracking-wider">{stat.label}</div>
              <div className={`mt-1 text-2xl font-bold ${stat.color}`}>{stat.val}</div>
            </div>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          
          {/* Signal Feed */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Signal Feed</h2>
              <button className="text-xs font-medium text-slate-400 hover:text-white flex items-center gap-1">
                <Filter size={14} /> Filter
              </button>
            </div>

            {/* Mock Signals */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card rounded-2xl p-6 border-l-4 border-l-cyan-500 hover:bg-slate-900/80 transition-all cursor-pointer group">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-white">NVDA</span>
                      <span className="rounded bg-cyan-500/20 px-2 py-0.5 text-xs font-bold text-cyan-400">CALL</span>
                      <span className="text-xs text-slate-500">15m ago</span>
                    </div>
                    <div className="mt-2 text-sm text-slate-300">
                      Institutional Vice detected. Heavy absorption at 875.50 level.
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-mono font-bold text-emerald-400">875.50</div>
                    <div className="text-xs text-slate-500">Entry Zone</div>
                  </div>
                </div>
                <div className="mt-4 flex gap-4 border-t border-white/5 pt-4 text-xs font-mono text-slate-400 group-hover:text-slate-300">
                  <span>TP1: 885.00</span>
                  <span>TP2: 900.00</span>
                  <span className="text-red-400/80">SL: 868.00</span>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
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

            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-bold text-white mb-4">Watchlist</h3>
              <div className="space-y-3">
                {[
                  { sym: "AMD", price: "174.20", chg: "+2.1%" },
                  { sym: "COIN", price: "245.50", chg: "-0.5%" },
                  { sym: "TSLA", price: "178.90", chg: "+1.2%" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="font-bold text-white">{item.sym}</span>
                    <div className="text-right">
                      <div className="text-white">{item.price}</div>
                      <div className={item.chg.startsWith("+") ? "text-emerald-400" : "text-red-400"}>{item.chg}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

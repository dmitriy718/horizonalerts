"use client";
import { useState } from "react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  // Mock Data
  const user = {
    email: "trader@example.com",
    username: "DiamondHands77",
    bio: "Swing trader focused on tech and energy sectors.",
    streak: 14,
    hands: "Diamond", // vs Paper
    favTickers: ["NVDA", "AMD", "TSLA"]
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="mx-auto max-w-5xl px-6">
        <h1 className="mb-8 text-3xl font-bold text-white">Settings</h1>

        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside className="space-y-2">
            {["Profile", "Subscription", "Gamification", "Security"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`w-full rounded-lg px-4 py-2 text-left text-sm transition-all ${
                  activeTab === tab.toLowerCase()
                    ? "bg-cyan-500/10 text-cyan-400 font-bold"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </aside>

          <main className="space-y-6">
            {/* Gamification Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="glass-card rounded-xl p-4 text-center">
                <div className="text-xs font-bold uppercase text-slate-500">Login Streak</div>
                <div className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                  🔥 {user.streak} Days
                </div>
              </div>
              <div className="glass-card rounded-xl p-4 text-center">
                <div className="text-xs font-bold uppercase text-slate-500">Hands Status</div>
                <div className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                  💎 {user.hands}
                </div>
              </div>
              <div className="glass-card rounded-xl p-4 text-center">
                <div className="text-xs font-bold uppercase text-slate-500">Pips Caught</div>
                <div className="text-2xl font-bold text-emerald-400">+1,240</div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-8">
              <h3 className="mb-6 text-xl font-bold text-white capitalize">{activeTab} Settings</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase text-slate-500">Display Name</label>
                  <input type="text" defaultValue={user.username} className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-white focus:border-cyan-500 focus:outline-none" />
                </div>
                
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase text-slate-500">Bio</label>
                  <textarea defaultValue={user.bio} rows={3} className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-white focus:border-cyan-500 focus:outline-none" />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase text-slate-500">Watchlist</label>
                  <div className="flex flex-wrap gap-2">
                    {user.favTickers.map(t => (
                      <span key={t} className="rounded-full bg-white/10 px-3 py-1 text-sm text-white">{t}</span>
                    ))}
                    <button className="rounded-full border border-dashed border-slate-600 px-3 py-1 text-sm text-slate-500 hover:text-white hover:border-white">+ Add</button>
                  </div>
                </div>

                <div className="pt-4">
                  <button className="btn-primary">Save Changes</button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
"use client";
import { useState } from "react";
import { Camera, Mail, Lock, User, Trophy, Flame, Target, Shield, Zap } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);

  // Mock User State
  const [user, setUser] = useState({
    displayName: "CryptoKing99",
    email: "trader@example.com",
    bio: "Swing trader looking for high beta plays. Not financial advice.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=CryptoKing99",
    favStocks: ["NVDA", "MSTR", "COIN"],
    watching: ["TSLA", "AMD"],
    // Gamification Attributes
    stats: {
      diamondHands: 87, // 0-100 score
      winStreak: 12,
      riskLevel: "Degen", // Conservative, Aggressive, Degen
      sectorBadge: "Tech Titan",
      reputation: 450, // Community score
      pipsCaptured: 12400
    }
  });

  return (
    <div className="min-h-screen pt-24 pb-20 bg-slate-950">
      <div className="mx-auto max-w-6xl px-6">
        <h1 className="mb-8 text-3xl font-bold text-white">Account Settings</h1>

        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* Sidebar */}
          <aside className="space-y-2">
            {[
              { id: "profile", label: "Public Profile", icon: User },
              { id: "account", label: "Account Security", icon: Lock },
              { id: "gamification", label: "Trader Stats", icon: Trophy },
              { id: "notifications", label: "Notifications", icon: Mail },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-all ${
                  activeTab === item.id
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </aside>

          {/* Main Content */}
          <main className="space-y-6">
            
            {/* Gamification Header (Always Visible) */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Flame size={48} /></div>
                <div className="text-xs font-bold uppercase text-slate-500 tracking-wider">Win Streak</div>
                <div className="mt-2 text-3xl font-bold text-white flex items-center gap-2">
                  {user.stats.winStreak} <span className="text-lg text-orange-500">Days 🔥</span>
                </div>
              </div>
              <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Shield size={48} /></div>
                <div className="text-xs font-bold uppercase text-slate-500 tracking-wider">Hands Score</div>
                <div className="mt-2 text-3xl font-bold text-white flex items-center gap-2">
                  {user.stats.diamondHands} <span className="text-lg text-cyan-400">/ 100 💎</span>
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800">
                  <div className="h-full rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" style={{ width: `${user.stats.diamondHands}%` }} />
                </div>
              </div>
              <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Target size={48} /></div>
                <div className="text-xs font-bold uppercase text-slate-500 tracking-wider">Sector Rank</div>
                <div className="mt-2 text-2xl font-bold text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {user.stats.sectorBadge}
                </div>
                <div className="text-xs text-slate-400 mt-1">Top 5% in Technology</div>
              </div>
            </div>

            {/* Tab Content */}
            <div className="glass-card rounded-2xl p-8 border border-white/10">
              {activeTab === "profile" && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Public Profile</h2>
                    <button 
                      onClick={() => setIsEditing(!isEditing)}
                      className="text-sm font-semibold text-cyan-400 hover:text-cyan-300"
                    >
                      {isEditing ? "Save Changes" : "Edit Profile"}
                    </button>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="relative h-24 w-24">
                      <img src={user.avatar} alt="Avatar" className="h-full w-full rounded-full border-4 border-slate-800 bg-slate-800" />
                      {isEditing && (
                        <button className="absolute bottom-0 right-0 rounded-full bg-cyan-500 p-2 text-black shadow-lg hover:bg-cyan-400">
                          <Camera size={16} />
                        </button>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{user.displayName}</h3>
                      <div className="flex gap-2 mt-1">
                        <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-400 border border-purple-500/20">
                          PRO MEMBER
                        </span>
                        <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-400 border border-red-500/20">
                          {user.stats.riskLevel.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-slate-500">Display Name</label>
                      <input 
                        disabled={!isEditing}
                        type="text" 
                        value={user.displayName}
                        onChange={(e) => setUser({...user, displayName: e.target.value})}
                        className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-white focus:border-cyan-500 focus:outline-none disabled:opacity-50" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-slate-500">Email Address</label>
                      <input 
                        disabled={!isEditing}
                        type="email" 
                        value={user.email} 
                        className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-white focus:border-cyan-500 focus:outline-none disabled:opacity-50" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-slate-500">Bio</label>
                    <textarea 
                      disabled={!isEditing}
                      rows={3} 
                      value={user.bio}
                      className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-white focus:border-cyan-500 focus:outline-none disabled:opacity-50" 
                    />
                  </div>

                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <label className="text-xs font-bold uppercase text-slate-500">Watchlist & Favorites</label>
                    <div className="flex flex-wrap gap-2">
                      {user.favStocks.map(ticker => (
                        <span key={ticker} className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-sm font-medium text-emerald-400 border border-emerald-500/20">
                          {ticker}
                          {isEditing && <button className="hover:text-emerald-200">×</button>}
                        </span>
                      ))}
                      {user.watching.map(ticker => (
                        <span key={ticker} className="flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1.5 text-sm font-medium text-blue-400 border border-blue-500/20">
                          {ticker} 👁️
                          {isEditing && <button className="hover:text-blue-200">×</button>}
                        </span>
                      ))}
                      {isEditing && (
                        <button className="rounded-full border border-dashed border-slate-600 px-3 py-1.5 text-sm text-slate-500 hover:text-white hover:border-white transition-colors">
                          + Add Ticker
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "account" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-white">Security Settings</h2>
                  <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6">
                    <div className="flex items-start gap-4">
                      <Zap className="text-red-400 shrink-0" />
                      <div>
                        <h3 className="font-bold text-red-400">Danger Zone</h3>
                        <p className="text-sm text-red-200 mt-1">
                          Deleting your account is irreversible. All your gamification stats and trading history will be lost.
                        </p>
                        <button className="mt-4 rounded-lg bg-red-500/10 px-4 py-2 text-sm font-bold text-red-400 hover:bg-red-500/20 transition-colors">
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

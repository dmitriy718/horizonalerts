"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, ChevronRight, User, LogOut, Settings, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/auth-context";

function Logo() {
  return (
    <div className="relative flex items-center justify-center">
      <div className="absolute -inset-3 rounded-full bg-cyan-500/20 blur-xl animate-pulse-slow" />
      <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
        <span className="font-mono text-xl font-bold text-white">H</span>
      </div>
    </div>
  );
}

export function Navbar() {
  const { user, loading, logOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => setIsOpen(false), [pathname]);

  const navLinks = [
    { name: "Pricing", href: "/pricing" },
    { name: "Academy", href: "/academy" },
    { name: "Blog", href: "/blog" },
    { name: "Scanner", href: "/dashboard" }, // Promoted
  ];

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-500 ${
        scrolled || isOpen ? "bg-slate-950/80 backdrop-blur-2xl border-b border-white/5" : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="group relative z-50 flex items-center gap-3">
          <Logo />
          <div className="hidden flex-col md:flex">
            <span className="text-lg font-bold tracking-tight text-white group-hover:text-cyan-400 transition-colors">
              Horizon Alerts
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 rounded-full border border-white/5 bg-white/5 p-1 backdrop-blur-md md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                pathname === link.href 
                  ? "bg-white/10 text-white shadow-inner" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          {loading ? (
            <div className="h-10 w-32 animate-pulse rounded-xl bg-white/5" />
          ) : user ? (
            <div className="group relative">
              <button className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-900/50 px-4 py-2 pr-5 transition-all hover:border-cyan-500/30 hover:bg-slate-900">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 text-xs font-bold text-white shadow-lg shadow-cyan-500/20">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <div className="text-xs font-medium text-slate-400">Trader</div>
                  <div className="text-xs font-bold text-white leading-none">{user.email?.split('@')[0]}</div>
                </div>
              </button>
              
              {/* Dropdown */}
              <div className="absolute right-0 top-full mt-2 w-56 origin-top-right scale-95 opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100 invisible group-hover:visible pt-2">
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl shadow-black/50 ring-1 ring-white/5">
                  <div className="bg-white/5 px-4 py-3">
                    <p className="text-xs font-medium text-slate-400">Signed in as</p>
                    <p className="truncate text-sm font-bold text-white">{user.email}</p>
                  </div>
                  <div className="p-1">
                    <Link href="/settings" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white">
                      <Settings size={16} /> Settings
                    </Link>
                    <Link href="/dashboard" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white">
                      <Sparkles size={16} /> Premium
                    </Link>
                  </div>
                  <div className="border-t border-white/5 p-1">
                    <button onClick={logOut} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10">
                      <LogOut size={16} /> Sign out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                Login
              </Link>
              <Link
                href="/pricing"
                className="group relative overflow-hidden rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-black transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105"
              >
                <span className="relative z-10">Get Access</span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white to-transparent opacity-50 transition-transform duration-1000 group-hover:animate-shimmer" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative z-50 block rounded-full bg-white/5 p-2 text-white md:hidden hover:bg-white/10 transition-colors"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "100vh" }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute inset-0 top-0 w-full bg-slate-950 pt-28 px-6 md:hidden overflow-hidden"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={link.href}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-4 text-lg font-semibold text-white active:scale-95 transition-transform"
                  >
                    {link.name}
                    <ChevronRight className="text-slate-600" />
                  </Link>
                </motion.div>
              ))}
              
              <div className="mt-8 flex flex-col gap-4">
                {user ? (
                  <>
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold">
                        {user.email?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-white font-bold">{user.email}</div>
                        <div className="text-xs text-emerald-400">Premium Member</div>
                      </div>
                    </div>
                    <button onClick={logOut} className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-center font-bold text-red-400">
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/pricing" className="rounded-xl bg-white p-4 text-center font-bold text-black shadow-lg shadow-white/10">
                      Start Membership
                    </Link>
                    <Link href="/login" className="rounded-xl border border-white/10 bg-white/5 p-4 text-center font-bold text-white">
                      Member Login
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}